package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.example.backend.dto.MenuItemDto;
import org.example.backend.entity.Categories;
import org.example.backend.entity.MenuItem;
import org.example.backend.repository.CategoryRepository;
import org.example.backend.repository.MenuItemRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoriesRepository;

    // --- BASIC CRUD ---
    public List<MenuItemDto> findAll() {
        return menuItemRepository.findAll()
                .stream()
                .map(MenuItemDto::new)
                .collect(Collectors.toList());
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
