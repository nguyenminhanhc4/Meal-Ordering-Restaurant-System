package org.example.backend.controller.ingredient;

import org.example.backend.dto.Response;
import org.example.backend.dto.ingredient.IngredientDto;
import org.example.backend.service.ingredient.IngredientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ingredients")
public class IngredientController {

    @Autowired
    private IngredientService ingredientService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllIngredients() {
        List<IngredientDto> ingredients = ingredientService.findAll();
        return ResponseEntity.ok(new Response<>("success", ingredients, "Ingredients retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getIngredientById(@PathVariable Long id) {
        IngredientDto ingredient = ingredientService.getById(id);
        return ResponseEntity.ok(new Response<>("success", ingredient, "Ingredient retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createIngredient(@RequestBody IngredientDto dto) {
        IngredientDto saved = ingredientService.save(dto);
        return ResponseEntity.ok(new Response<>("success", saved, "Ingredient created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateIngredient(@PathVariable Long id, @RequestBody IngredientDto dto) {
        IngredientDto updated = ingredientService.updateById(id, dto);
        return ResponseEntity.ok(new Response<>("success", updated, "Ingredient updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteIngredient(@PathVariable Long id) {
        ingredientService.deleteById(id);
        return ResponseEntity.ok(new Response<>("success", null, "Ingredient deleted successfully"));
    }
}
