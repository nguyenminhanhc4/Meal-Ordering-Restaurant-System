package org.example.backend.service.menu;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.menu.ComboDto;
import org.example.backend.entity.category.Categories;
import org.example.backend.entity.menu.Combo;
import org.example.backend.entity.menu.MenuItem;
import org.example.backend.entity.param.Param;
import org.example.backend.repository.category.CategoryRepository;
import org.example.backend.repository.menu.ComboRepository;
import org.example.backend.repository.menu.MenuItemRepository;
import org.example.backend.repository.param.ParamRepository;
import org.example.backend.util.WebSocketNotifier;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComboService {

    private final ComboRepository comboRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final ParamRepository paramRepository;
    private final Cloudinary cloudinary;
    private final WebSocketNotifier webSocketNotifier;

    // =============================================
    // BASIC CRUD
    // =============================================

    @Transactional(readOnly = true)
    public List<ComboDto> findAll() {
        return comboRepository.findAll()
                .stream()
                .map(ComboDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ComboDto> findById(Long id) {
        return comboRepository.findById(id).map(ComboDto::new);
    }

    public ComboDto getById(Long id) {
        return comboRepository.findById(id)
                .map(ComboDto::new)
                .orElseThrow(() -> new RuntimeException("Combo not found"));
    }

    // =============================================
    // PAGINATION + SEARCH
    // =============================================

    @Transactional(readOnly = true)
    public Page<ComboDto> findAll(int page, int size, String search, String sort, Long typeCategoryId) {
        Sort sortOption;
        String sortLower = sort != null ? sort.toLowerCase() : "popular";
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        // 🔹 Define sorting option
        if ("price-asc".equals(sortLower)) {
            sortOption = Sort.by(Sort.Direction.ASC, "c.price");
        } else if ("price-desc".equals(sortLower)) {
            sortOption = Sort.by(Sort.Direction.DESC, "c.price");
        } else if ("newest".equals(sortLower)) {
            sortOption = Sort.by(Sort.Direction.DESC, "c.createdAt");
        } else {
            sortOption = Sort.unsorted(); // custom logic for "popular"
        }

        Pageable pageable = PageRequest.of(page, size, sortOption);
        Page<Combo> results;

        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasCategory = typeCategoryId != null;

        // 🔹 Choose query dynamically based on filters
        if (hasSearch && hasCategory) {
            results = comboRepository.findByTypeCategoryAndName(typeCategoryId, search.trim(), pageable);
        } else if (hasSearch) {
            results = comboRepository.findAllWithDetailsByName(search.trim(), pageable);
        } else if (hasCategory) {
            results = comboRepository.findByTypeCategory(typeCategoryId, pageable);
        } else if ("popular".equals(sortLower)) {
            results = comboRepository.findAllWithDetailsOrdered(sevenDaysAgo, pageable);
        } else {
            results = comboRepository.findAllWithDetails(pageable);
        }

        // 🔹 Map Page<Combo> results to Page<ComboDto>
        return results.map(combo -> new ComboDto(combo));
    }

    // =============================================
    // CREATE / UPDATE
    // =============================================

    @Transactional
    public ComboDto save(ComboDto dto) {
        Combo entity = toEntity(dto);
        entity = comboRepository.save(entity);

//        webSocketNotifier.notifyNewCombo(entity.getId(), entity.getName(), entity.getPrice());
        return new ComboDto(entity);
    }

    @Transactional
    public ComboDto updateById(Long id, ComboDto dto) {
        Combo entity = comboRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Combo not found"));

        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setDiscountPercent(dto.getDiscountPercent());

        // === CATEGORY LINKS ===
        if (dto.getTypeCategoryId() != null) {
            Categories type = categoryRepository.findById(dto.getTypeCategoryId())
                    .orElseThrow(() -> new RuntimeException("Type category not found"));
            entity.setTypeCategory(type);
        }

//        if (dto.getAvailabilityCategoryId() != null) {
//            Categories availability = categoryRepository.findById(dto.getAvailabilityCategoryId())
//                    .orElseThrow(() -> new RuntimeException("Availability category not found"));
//            entity.setAvailabilityCategory(availability);
//        }

        if (dto.getPeopleCategoryId() != null) {
            Categories people = categoryRepository.findById(dto.getPeopleCategoryId())
                    .orElseThrow(() -> new RuntimeException("People category not found"));
            entity.setPeopleCategory(people);
        }

        // === MENU ITEMS ===
        if (dto.getMenuItemIds() != null && !dto.getMenuItemIds().isEmpty()) {
            List<MenuItem> items = menuItemRepository.findAllById(dto.getMenuItemIds());
            entity.setMenuItems(items);
        }

        comboRepository.save(entity);
//        webSocketNotifier.notifyUpdatedCombo(entity.getId(), entity.getName(), entity.getPrice());

        return new ComboDto(entity);
    }

    // =============================================
    // DELETE
    // =============================================

    @Transactional
    public void deleteById(Long id) {
        try {
            Combo combo = comboRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Combo not found"));

            // You can add foreign key safety checks here if combos are referenced in orders
            comboRepository.delete(combo);

//            webSocketNotifier.notifyDeletedCombo(id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete combo: " + e.getMessage());
        }
    }

    // =============================================
    // CLOUDINARY UPLOAD
    // =============================================

    public String uploadComboImage(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) return null;

        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "public_id", fileName,
                        "overwrite", true
                ));

        return uploadResult.get("secure_url").toString();
    }

    // =============================================
    // MAPPING: DTO → ENTITY
    // =============================================

    private Combo toEntity(ComboDto dto) {
        Combo entity = new Combo();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setDiscountPercent(dto.getDiscountPercent());

        // === CATEGORY LINKS ===
        if (dto.getTypeCategoryId() != null) {
            Categories type = categoryRepository.findById(dto.getTypeCategoryId())
                    .orElseThrow(() -> new RuntimeException("Type category not found"));
            entity.setTypeCategory(type);
        }

//        if (dto.getAvailabilityCategoryId() != null) {
//            Categories availability = categoryRepository.findById(dto.getAvailabilityCategoryId())
//                    .orElseThrow(() -> new RuntimeException("Availability category not found"));
//            entity.setAvailabilityCategory(availability);
//        }

        if (dto.getPeopleCategoryId() != null) {
            Categories people = categoryRepository.findById(dto.getPeopleCategoryId())
                    .orElseThrow(() -> new RuntimeException("People category not found"));
            entity.setPeopleCategory(people);
        }

        // === STATUS ===
        if (dto.getStatusId() != null) {
            Param status = paramRepository.findById(dto.getStatusId())
                    .orElseThrow(() -> new RuntimeException("Status not found"));
            entity.setStatus(status);
        }

        // === MENU ITEMS ===
        if (dto.getMenuItemIds() != null && !dto.getMenuItemIds().isEmpty()) {
            List<MenuItem> items = menuItemRepository.findAllById(dto.getMenuItemIds());
            entity.setMenuItems(items);
        }

        return entity;
    }
}
