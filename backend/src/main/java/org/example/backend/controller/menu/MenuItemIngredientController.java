package org.example.backend.controller.menu;

import org.example.backend.dto.Response;
import org.example.backend.dto.menu.MenuItemIngredientDto;
import org.example.backend.service.menu.MenuItemIngredientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menu-item-ingredients")
public class MenuItemIngredientController {

    @Autowired
    private MenuItemIngredientService menuItemIngredientService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAll() {
        List<MenuItemIngredientDto> list = menuItemIngredientService.findAll();
        return ResponseEntity.ok(new Response<>("success", list, "Menu item ingredients retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        MenuItemIngredientDto dto = menuItemIngredientService.getById(id);
        return ResponseEntity.ok(new Response<>("success", dto, "Menu item ingredient retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody MenuItemIngredientDto dto) {
        MenuItemIngredientDto saved = menuItemIngredientService.save(dto);
        return ResponseEntity.ok(new Response<>("success", saved, "Menu item ingredient created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody MenuItemIngredientDto dto) {
        MenuItemIngredientDto updated = menuItemIngredientService.updateById(id, dto);
        return ResponseEntity.ok(new Response<>("success", updated, "Menu item ingredient updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        menuItemIngredientService.deleteById(id);
        return ResponseEntity.ok(new Response<>("success", null, "Menu item ingredient deleted successfully"));
    }
}
