package org.example.backend.service.menu;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.menu.ComboDto;
import org.example.backend.dto.menu.ComboItemDto;
import org.example.backend.dto.menu.ComboRequest;
import org.example.backend.dto.menu.ComboItemRequest;
import org.example.backend.entity.menu.Combo;
import org.example.backend.entity.menu.ComboItem;
import org.example.backend.entity.menu.MenuItem;
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
        return comboRepository.findById(id).map(this::toDto).orElseThrow(() -> new RuntimeException("Combo not found"));
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
        Combo combo = comboRepository.findById(id).orElseThrow(() -> new RuntimeException("Combo not found"));

        mapRequestToEntity(request, combo);
        Combo updated = comboRepository.save(combo);
        return toDto(updated);
    }

    @Transactional
    public void delete(Long id) {
        Combo combo = comboRepository.findById(id).orElseThrow(() -> new RuntimeException("Combo not found"));
        comboItemRepository.deleteAll(combo.getItems());
        comboRepository.delete(combo);
    }

    // ===== Helper Mapping =====
    private void mapRequestToEntity(ComboRequest request, Combo combo) {
        combo.setName(request.getName());
        combo.setDescription(request.getDescription());
        combo.setAvatarUrl(request.getAvatarUrl());

        if (request.getCategoryId() != null) {
            combo.setCategory(categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found")));
        }

        if (request.getStatusId() != null) {
            combo.setStatus(paramRepository.findById(request.getStatusId())
                    .orElseThrow(() -> new RuntimeException("Status not found")));
        }

        if (request.getItems() != null) {
            // Map menuItemId -> quantity trong request
            Map<Long, Integer> requestedItems = request.getItems().stream()
                    .collect(Collectors.toMap(
                            ComboItemRequest::getMenuItemId,
                            item -> item.getQuantity() != null ? item.getQuantity() : 1
                    ));

            // Xóa những ComboItem không còn trong request
            combo.getItems().removeIf(ci -> !requestedItems.containsKey(ci.getMenuItem().getId()));

            // Merge hoặc thêm mới ComboItem
            for (Map.Entry<Long, Integer> entry : requestedItems.entrySet()) {
                Long menuItemId = entry.getKey();
                Integer qty = entry.getValue();

                // Kiểm tra xem item này đã có trong combo chưa
                ComboItem existing = combo.getItems().stream()
                        .filter(ci -> ci.getMenuItem().getId().equals(menuItemId))
                        .findFirst()
                        .orElse(null);

                if (existing != null) {
                    // Nếu đã tồn tại, cộng dồn quantity
                    existing.setQuantity(existing.getQuantity() + qty);
                } else {
                    // Nếu chưa có, tạo mới
                    MenuItem menuItem = menuItemRepository.findById(menuItemId)
                            .orElseThrow(() -> new RuntimeException("MenuItem not found: " + menuItemId));
                    ComboItem ci = new ComboItem();
                    ci.setCombo(combo);
                    ci.setMenuItem(menuItem);
                    ci.setQuantity(qty);
                    combo.getItems().add(ci);
                }
            }

            // Tính tổng giá và giảm 10%
            BigDecimal total = combo.getItems().stream()
                    .map(ci -> ci.getMenuItem().getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            combo.setPrice(total.subtract(total.multiply(BigDecimal.valueOf(0.1))));
        } else {
            combo.getItems().clear();
            combo.setPrice(BigDecimal.ZERO);
        }
    }


    private ComboDto toDto(Combo combo) {
        return ComboDto.builder().id(combo.getId()).name(combo.getName()).description(combo.getDescription()).avatarUrl(combo.getAvatarUrl()).price(combo.getPrice()).category(combo.getCategory() != null ? combo.getCategory().getName() : null).status(combo.getStatus() != null ? combo.getStatus().getName() : null).items(toItemDtos(combo.getItems())).build();
    }

    private List<ComboItemDto> toItemDtos(List<ComboItem> items) {
        if (items == null) return List.of();
        return items.stream().map(item -> ComboItemDto.builder().id(item.getMenuItem().getId()).name(item.getMenuItem().getName()).quantity(item.getQuantity()).price(item.getMenuItem().getPrice()).avatarUrl(item.getMenuItem().getAvatarUrl()).category(item.getMenuItem().getCategory() != null ? item.getMenuItem().getCategory().getName() : null).build()).collect(Collectors.toList());
    }
}
