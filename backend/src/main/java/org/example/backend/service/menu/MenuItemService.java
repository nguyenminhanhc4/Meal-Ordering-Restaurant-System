package org.example.backend.service.menu;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.example.backend.dto.menu.MenuItemDto;
import org.example.backend.entity.category.Categories;
import org.example.backend.entity.menu.MenuItem;
import org.example.backend.repository.category.CategoryRepository;
import org.example.backend.repository.menu.MenuItemRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoriesRepository;

    // --- BASIC CRUD ---
    @Transactional(readOnly = true)
    public List<MenuItemDto> findAll() {
        List<Object[]> results = menuItemRepository.findAllWithDetails();
        System.out.println("Number of results: " + results.size()); // Debug
        for (Object[] result : results) {
            MenuItem entity = (MenuItem) result[0];
            System.out.println("MenuItem: " + entity.getName());
        }
        return results.stream()
                .map(this::toMenuItemDto)
                .collect(Collectors.toList());
    }

    private MenuItemDto toMenuItemDto(Object[] result) {
        MenuItem entity = (MenuItem) result[0];
        MenuItemDto dto = new MenuItemDto(entity);
        dto.setCategoryName((String) result[1]);
        dto.setCategorySlug((String) result[2]);
        dto.setStatus((String) result[3]);
        dto.setRating((Double) result[4]);
        dto.setSold(((Number) result[5]).longValue());
        // Nếu có tags, thêm logic ở đây (ví dụ: parse từ cột tags trong menu_items)
        // dto.setTags(Arrays.asList("traditional", "spicy")); // Ví dụ
        return dto;
    }

    public Optional<MenuItemDto> findById(Long id) {
        return menuItemRepository.findById(id)
                .map(MenuItemDto::new);
    }

    public MenuItemDto save(MenuItemDto dto) {
        MenuItem entity = toEntity(dto);
        entity = menuItemRepository.save(entity);
        return new MenuItemDto(entity);
    }

    public void delete(Long id) {
        menuItemRepository.deleteById(id);
    }

    // --- NEW METHODS ---
    public MenuItemDto getById(Long id) {
        MenuItem entity = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MenuItem not found"));
        return new MenuItemDto(entity);
    }

    public MenuItemDto updateById(Long id, MenuItemDto dto) {
        MenuItem entity = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MenuItem not found"));

        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setAvatarUrl(dto.getAvatarUrl());

        if (dto.getCategoryId() != null) {
            Categories category = categoriesRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            entity.setCategory(category);
        }

        entity = menuItemRepository.save(entity);
        return new MenuItemDto(entity);
    }

    public void deleteById(Long id) {
        MenuItem entity = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MenuItem not found"));
        menuItemRepository.delete(entity);
    }

    // --- Conversion helper ---
    private MenuItem toEntity(MenuItemDto dto) {
        MenuItem entity = new MenuItem();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setAvatarUrl(dto.getAvatarUrl());

        if (dto.getCategoryId() != null) {
            Categories category = categoriesRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            entity.setCategory(category);
        }

        return entity;
    }
}
