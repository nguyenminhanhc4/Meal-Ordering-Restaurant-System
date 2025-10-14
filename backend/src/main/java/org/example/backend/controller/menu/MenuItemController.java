package org.example.backend.controller.menu;

import org.example.backend.dto.Response;
import org.example.backend.dto.menu.MenuItemDto;
import org.example.backend.dto.menu.MenuItemCreateDTO;
import org.example.backend.dto.menu.MenuItemUpdateDTO;
import org.example.backend.dto.menu.MenuItemSearchRequest;
import org.example.backend.service.menu.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/menu-items")
public class MenuItemController {

    @Autowired
    private MenuItemService menuItemService;

    @GetMapping
    public ResponseEntity<?> getAllMenuItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "popular") String sort,
            @RequestParam(required = false) String categorySlug
    ) {
        Page<MenuItemDto> menuItems = menuItemService.findAll(page, size,search, sort, categorySlug);
        return ResponseEntity.ok(
                new Response<>("success", menuItems, "Menu items retrieved successfully")
        );
    }


    @GetMapping("/top-popular")
    public ResponseEntity<?> getTopPopularMenuItems() {
        int limit = 6; // top 6
        List<MenuItemDto> topPopular = menuItemService.findTopPopular(limit);
        return ResponseEntity.ok(
                new Response<>("success", topPopular, "Top popular menu items retrieved successfully")
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMenuItemById(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "0") Integer reviewPage,
            @RequestParam(required = false, defaultValue = "5") Integer reviewSize,
            @RequestParam(required = false, defaultValue = "all") String reviewFilter
    ) {
        MenuItemDto menuItem = menuItemService.getById(id, reviewPage, reviewSize, reviewFilter);
        return ResponseEntity.ok(new Response<>("success", menuItem, "Menu item retrieved successfully"));
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

    // --- Upload ảnh riêng ---
    @PostMapping("/{id}/avatar")
    public ResponseEntity<MenuItemDto> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("avatar") MultipartFile avatar) throws IOException {

        MenuItemDto updated = menuItemService.uploadMenuItemAvatar(id, avatar);
        return ResponseEntity.ok(updated);
    }

    // Upload ảnh độc lập (không cần menuItem ID)
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadMenuItemImage(
            @RequestParam("image") MultipartFile image) throws IOException {
        try {
            String imageUrl = menuItemService.uploadImageToCloudinary(image, "menu");
            return ResponseEntity.ok(
                new Response<>("success", imageUrl, "Image uploaded successfully")
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new Response<>("error", null, "Failed to upload image: " + e.getMessage()));
        }
    }

    // ===========================================
    // ADMIN APIs for MenuItem Management
    // ===========================================

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllMenuItemsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        Page<MenuItemDto> menuItems = menuItemService.findAllForAdmin(page, size, sortBy, sortDirection);
        return ResponseEntity.ok(
                new Response<>("success", menuItems, "Menu items for admin retrieved successfully")
        );
    }

    @PostMapping("/admin/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchMenuItemsForAdmin(
            @RequestBody MenuItemSearchRequest searchRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Page<MenuItemDto> menuItems = menuItemService.searchMenuItemsWithPagination(searchRequest, page, size);
        return ResponseEntity.ok(
                new Response<>("success", menuItems, "Menu items search results retrieved successfully")
        );
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createMenuItemForAdmin(@RequestBody MenuItemCreateDTO dto) {
        MenuItemDto saved = menuItemService.createMenuItem(dto);
        return ResponseEntity.ok(
                new Response<>("success", saved, "Menu item created successfully")
        );
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateMenuItemForAdmin(@PathVariable Long id, @RequestBody MenuItemUpdateDTO dto) {
        MenuItemDto updated = menuItemService.updateMenuItem(id, dto);
        return ResponseEntity.ok(
                new Response<>("success", updated, "Menu item updated successfully")
        );
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMenuItemForAdmin(@PathVariable Long id) {
        try {
            menuItemService.deleteById(id);
            return ResponseEntity.ok(
                new Response<>("success", null, "Menu item deleted successfully")
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new Response<>("error", null, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(new Response<>("error", null, "Internal server error: " + e.getMessage()));
        }
    }
}