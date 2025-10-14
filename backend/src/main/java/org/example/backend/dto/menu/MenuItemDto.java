package org.example.backend.dto.menu;

import lombok.Data;
import org.example.backend.dto.review.ReviewDto;
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
    private Long statusId; // Add statusId for edit mode
    private LocalDateTime createdAt; // Từ menu_items
    private Double rating; // Trung bình từ reviews
    private Long sold; // Tổng quantity từ order_items
    private List<String> tags; // Nếu có
    private List<ReviewDto> reviews;
    private Integer availableQuantity;
    private List<MenuItemIngredientDto> ingredients; // Add ingredients list for edit mode

    // 🆕 Thêm các trường phân trang review
    private Long totalReviews;          // tổng số review
    private Integer reviewPages;        // tổng số trang
    private Integer currentReviewPage;  // trang hiện tại

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
        this.categorySlug = entity.getCategory() != null
                ? entity.getCategory().getName().toLowerCase().replace(" ", "-")
                : null;
        this.status = entity.getStatus() != null ? entity.getStatus().getCode() : null;
        this.statusId = entity.getStatus() != null ? entity.getStatus().getId() : null;
        this.tags = entity.getMenuItemIngredients() != null
                ? entity.getMenuItemIngredients().stream()
                .map(mii -> mii.getIngredient().getName())
                .collect(Collectors.toList())
                : null;
        this.reviews = entity.getReviews() != null
                ? entity.getReviews().stream().map(ReviewDto::new).collect(Collectors.toList())
                : null;
        this.availableQuantity = entity.getInventory() != null
                ? entity.getInventory().getQuantity()
                : 0;
        this.ingredients = entity.getMenuItemIngredients() != null
                ? entity.getMenuItemIngredients().stream().map(MenuItemIngredientDto::new).collect(Collectors.toList())
                : null;
    }
}