package org.example.backend.service.menu;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.menu.MenuItemIngredientDto;
import org.example.backend.entity.menu.MenuItemIngredient;
import org.example.backend.repository.ingredient.IngredientRepository;
import org.example.backend.repository.menu.MenuItemIngredientRepository;
import org.example.backend.repository.menu.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemIngredientService {

    private final MenuItemIngredientRepository menuItemIngredientRepository;
    private final MenuItemRepository menuItemRepository;
    private final IngredientRepository ingredientRepository;

    public List<MenuItemIngredientDto> findAll() {
        return menuItemIngredientRepository.findAll()
                .stream().map(MenuItemIngredientDto::new)
                .collect(Collectors.toList());
    }

    public Optional<MenuItemIngredientDto> findById(Long id) {
        return menuItemIngredientRepository.findById(id).map(MenuItemIngredientDto::new);
    }

    public MenuItemIngredientDto save(MenuItemIngredientDto dto) {
        MenuItemIngredient entity = toEntity(dto);
        return new MenuItemIngredientDto(menuItemIngredientRepository.save(entity));
    }

    public MenuItemIngredientDto getById(Long id) {
        return menuItemIngredientRepository.findById(id)
                .map(MenuItemIngredientDto::new)
                .orElseThrow(() -> new RuntimeException("MenuItemIngredient not found"));
    }

    public MenuItemIngredientDto updateById(Long id, MenuItemIngredientDto dto) {
        MenuItemIngredient entity = menuItemIngredientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MenuItemIngredient not found"));
        entity.setQuantityNeeded(dto.getQuantityNeeded());
        entity.setMenuItem(menuItemRepository.findById(dto.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("MenuItem not found")));
        entity.setIngredient(ingredientRepository.findById(dto.getIngredientId())
                .orElseThrow(() -> new RuntimeException("Ingredient not found")));
        return new MenuItemIngredientDto(menuItemIngredientRepository.save(entity));
    }

    public void deleteById(Long id) {
        MenuItemIngredient entity = menuItemIngredientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MenuItemIngredient not found"));
        menuItemIngredientRepository.delete(entity);
    }

    private MenuItemIngredient toEntity(MenuItemIngredientDto dto) {
        MenuItemIngredient entity = new MenuItemIngredient();
        entity.setId(dto.getId());
        entity.setQuantityNeeded(dto.getQuantityNeeded());
        entity.setMenuItem(menuItemRepository.findById(dto.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("MenuItem not found")));
        entity.setIngredient(ingredientRepository.findById(dto.getIngredientId())
                .orElseThrow(() -> new RuntimeException("Ingredient not found")));
        return entity;
    }
}
