package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.example.backend.dto.IngredientDto;
import org.example.backend.entity.Ingredient;
import org.example.backend.repository.IngredientRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    public List<IngredientDto> findAll() {
        return ingredientRepository.findAll()
                .stream()
                .map(IngredientDto::new)
                .collect(Collectors.toList());
    }

    public Optional<IngredientDto> findById(Long id) {
        return ingredientRepository.findById(id)
                .map(IngredientDto::new);
    }

    public IngredientDto save(IngredientDto dto) {
        Ingredient ingredient = toEntity(dto);
        ingredient = ingredientRepository.save(ingredient);
        return new IngredientDto(ingredient);
    }

    public void delete(Long id) {
        ingredientRepository.deleteById(id);
    }

    // --- NEW METHODS ---
    public IngredientDto getById(Long id) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ingredient not found"));
        return new IngredientDto(ingredient);
    }

    public IngredientDto updateById(Long id, IngredientDto dto) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ingredient not found"));

        ingredient.setName(dto.getName());
        ingredient.setQuantity(dto.getQuantity());
        ingredient.setUnit(dto.getUnit());

        ingredient = ingredientRepository.save(ingredient);
        return new IngredientDto(ingredient);
    }

    public void deleteById(Long id) {
        Ingredient ingredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ingredient not found"));
        ingredientRepository.delete(ingredient);
    }

    // Conversion helper
    private Ingredient toEntity(IngredientDto dto) {
        Ingredient entity = new Ingredient();
        entity.setId(dto.getId());
        entity.setMinimumStock(dto.getMinimumStock());
        entity.setName(dto.getName());
        entity.setQuantity(dto.getQuantity());
        entity.setUnit(dto.getUnit());
        return entity;
    }
}
