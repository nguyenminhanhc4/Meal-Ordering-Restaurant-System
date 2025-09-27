package org.example.backend.dto.menu;

import lombok.Data;
import org.example.backend.entity.category.Categories;
import org.example.backend.entity.menu.MenuItem;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class MenuItemDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String avatarUrl; // Ánh xạ sang image
    private Long categoryId;
    private String categoryName; // Thêm từ Categories
    private String categorySlug; // Tạo từ categoryName
    private String status; // Từ params (AVAILABLE, OUT_OF_STOCK)
    private LocalDateTime createdAt; // Từ menu_items
    private Double rating; // Trung bình từ reviews
    private Long sold; // Tổng quantity từ order_items
    private List<String> tags; // Nếu có

    // Constructor từ entity
    public MenuItemDto(MenuItem entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.description = entity.getDescription();
        this.price = entity.getPrice();
        this.avatarUrl = entity.getAvatarUrl();
        this.createdAt = entity.getCreatedAt();
        this.categoryId = entity.getCategory() != null ? entity.getCategory().getId() : null;
        this.categoryName = entity.getCategory() != null ? entity.getCategory().getName() : null;
        this.categorySlug = entity.getCategory() != null ?
                entity.getCategory().getName().toLowerCase().replace(" ", "-") : null;
        this.tags = entity.getMenuItemIngredients() != null ?
                entity.getMenuItemIngredients().stream()
                        .map(menuItemIngredient -> menuItemIngredient.getIngredient().getName())
                        .collect(Collectors.toList()) : null;
    }
}