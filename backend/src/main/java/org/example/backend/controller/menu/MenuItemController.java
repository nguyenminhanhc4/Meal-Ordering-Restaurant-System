package org.example.backend.controller.menu;

import org.example.backend.dto.Response;
import org.example.backend.dto.menu.MenuItemDto;
import org.example.backend.service.menu.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menu-items")
public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;

    @GetMapping
    public ResponseEntity<?> getAllMenuItems() {
        List<MenuItemDto> menuItems = menuItemService.findAll();
        return ResponseEntity.ok(
                new Response<>("success", menuItems, "Menu items retrieved successfully")
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMenuItemById(@PathVariable Long id) {
        MenuItemDto menuItem = menuItemService.getById(id);
        return ResponseEntity.ok(
                new Response<>("success", menuItem, "Menu item retrieved successfully")
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createMenuItem(@RequestBody MenuItemDto dto) {
        MenuItemDto saved = menuItemService.save(dto);
        return ResponseEntity.ok(
                new Response<>("success", saved, "Menu item created successfully")
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateMenuItem(@PathVariable Long id, @RequestBody MenuItemDto dto) {
        MenuItemDto updated = menuItemService.updateById(id, dto);
        return ResponseEntity.ok(
                new Response<>("success", updated, "Menu item updated successfully")
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long id) {
        menuItemService.deleteById(id);
        return ResponseEntity.ok(
                new Response<>("success", null, "Menu item deleted successfully")
        );
    }
}