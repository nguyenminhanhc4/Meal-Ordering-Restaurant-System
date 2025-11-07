package org.example.backend.service.menu;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.menu.*;
import org.example.backend.entity.menu.Combo;
import org.example.backend.entity.menu.ComboItem;
import org.example.backend.entity.menu.MenuItem;
import org.example.backend.exception.BadRequestException;
import org.example.backend.exception.NotFoundException;
import org.example.backend.repository.category.CategoryRepository;
import org.example.backend.repository.menu.ComboItemRepository;
import org.example.backend.repository.menu.ComboRepository;
import org.example.backend.repository.menu.MenuItemRepository;
import org.example.backend.repository.param.ParamRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ComboService {

    private final ComboRepository comboRepository;
    private final ComboItemRepository comboItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final ParamRepository paramRepository;

    @Transactional(readOnly = true)
    public Page<ComboDto> findAll(int page, int size, String search, Long categoryId, Long statusId, String sort) {
        Sort sortOption = switch (sort.toLowerCase()) {
            case "price-asc" -> Sort.by("price").ascending();
            case "price-desc" -> Sort.by("price").descending();
            case "newest" -> Sort.by("createdAt").descending();
            default -> Sort.by("name").ascending();
        };

        Pageable pageable = PageRequest.of(page, size, sortOption);
        Page<Combo> results = comboRepository.searchCombos(search, categoryId, statusId, pageable);
        return results.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public ComboDto findById(Long id) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Combo not found: " + id));
        return toDto(combo);
    }

    @Transactional
    public ComboDto create(ComboRequest request) {
        Combo combo = new Combo();
        mapRequestToEntity(request, combo);
        Combo saved = comboRepository.save(combo);
        return toDto(saved);
    }

    @Transactional
    public ComboDto update(Long id, ComboRequest request) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Combo not found: " + id));

        mapRequestToEntity(request, combo);
        Combo updated = comboRepository.save(combo);
        return toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Combo not found: " + id));
        comboItemRepository.deleteAll(combo.getItems());
        comboRepository.delete(combo);
    }

    // ===== Helper Mapping =====
    private void mapRequestToEntity(ComboRequest request, Combo combo) {
        // 1. Cập nhật thông tin cơ bản
        combo.setName(request.getName());
        combo.setDescription(request.getDescription());
        combo.setAvatarUrl(request.getAvatarUrl());

        // 2. Cập nhật Category
        combo.setCategory(
                request.getCategoryId() != null && request.getCategoryId() > 0
                        ? categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() -> new NotFoundException("Category not found: " + request.getCategoryId()))
                        : null
        );

        // 3. Cập nhật Status
        combo.setStatus(
                request.getStatusId() != null && request.getStatusId() > 0
                        ? paramRepository.findById(request.getStatusId())
                        .orElseThrow(() -> new NotFoundException("Status not found: " + request.getStatusId()))
                        : null
        );

        if (combo.getItems() == null) {
            combo.setItems(new ArrayList<>()); // ← QUAN TRỌNG
        }

        // 4. Lấy danh sách món được gửi từ Frontend
        List<ComboItemRequest> incoming = request.getItems() != null ? request.getItems() : List.of();

        // 5. Tạo map: menuItemId → quantity (dễ tra cứu)
        Map<Long, Integer> requestedMap = incoming.stream()
                .peek(item -> {
                    if (item.getMenuItemId() == null || item.getMenuItemId() <= 0)
                        throw new BadRequestException("menuItemId must not be null or <= 0");
                    if (item.getQuantity() == null || item.getQuantity() <= 0)
                        throw new BadRequestException("quantity must be > 0");
                })
                .collect(Collectors.toMap(
                        ComboItemRequest::getMenuItemId,
                        ComboItemRequest::getQuantity
                ));

        // 6. XÓA những món KHÔNG CÒN trong request
        combo.getItems().removeIf(ci -> !requestedMap.containsKey(ci.getMenuItem().getId()));

        // 7. CẬP NHẬT hoặc THÊM MỚI
        for (Map.Entry<Long, Integer> entry : requestedMap.entrySet()) {
            Long menuItemId = entry.getKey();
            int qty = entry.getValue();

            ComboItem existing = combo.getItems().stream()
                    .filter(ci -> ci.getMenuItem().getId().equals(menuItemId))
                    .findFirst()
                    .orElse(null);

            if (existing != null) {
                // Cập nhật số lượng (ghi đè, không cộng)
                existing.setQuantity(qty);
            } else {
                // Thêm mới
                MenuItem menuItem = menuItemRepository.findById(menuItemId)
                        .orElseThrow(() -> new NotFoundException("MenuItem not found: " + menuItemId));

                ComboItem newItem = new ComboItem();
                newItem.setCombo(combo);
                newItem.setMenuItem(menuItem);
                newItem.setQuantity(qty);
                combo.getItems().add(newItem);
            }
        }

        // 8. Tính lại giá combo
        BigDecimal totalPrice = combo.getItems().stream()
                .map(ci -> ci.getMenuItem().getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        combo.setPrice(totalPrice);
    }

    // ===== DTO Mapping =====
    private ComboDto toDto(Combo combo) {
        return ComboDto.builder()
                .id(combo.getId())
                .name(combo.getName())
                .description(combo.getDescription())
                .avatarUrl(combo.getAvatarUrl())
                .price(combo.getPrice())
                .category(combo.getCategory() != null ? combo.getCategory().getName() : null)
                .status(combo.getStatus() != null ? combo.getStatus().getCode() : null)
                .items(toItemDtos(combo.getItems()))
                .build();
    }

    private List<ComboItemDto> toItemDtos(List<ComboItem> items) {
        if (items == null || items.isEmpty()) return List.of();
        return items.stream()
                .map(item -> ComboItemDto.builder()
                        .id(item.getMenuItem().getId())
                        .name(item.getMenuItem().getName())
                        .quantity(item.getQuantity())
                        .price(item.getMenuItem().getPrice())
                        .avatarUrl(item.getMenuItem().getAvatarUrl())
                        .category(item.getMenuItem().getCategory() != null
                                ? item.getMenuItem().getCategory().getName()
                                : null)
                        .build())
                .collect(Collectors.toList());
    }
}