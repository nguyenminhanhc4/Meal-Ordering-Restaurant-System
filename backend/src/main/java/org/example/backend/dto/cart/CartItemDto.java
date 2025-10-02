package org.example.backend.dto.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.example.backend.entity.cart.CartItem;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDto {

    private Long id;
    @NotNull
    private Long menuItemId;
    private String menuItemName;
    private String avatarUrl;
    @Min(1)
    private Integer quantity;
    private BigDecimal price;
    private String status;
    private String description; // Thêm mô tả
    private String categoryName; // Thêm tên danh mục
    private Integer availableQuantity;

    public CartItemDto(CartItem entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.menuItemId = entity.getMenuItem().getId();
            this.quantity = entity.getQuantity();
            this.menuItemName = entity.getMenuItem().getName();
            this.avatarUrl = entity.getMenuItem().getAvatarUrl();
            this.price = entity.getMenuItem().getPrice();
            this.status = entity.getMenuItem().getStatus().getCode();
            this.description = entity.getMenuItem().getDescription();
            this.categoryName = entity.getMenuItem().getCategory().getName();
            this.availableQuantity = entity.getMenuItem().getInventory() != null
                    ? entity.getMenuItem().getInventory().getQuantity()
                    : null;
        }
    }
}
