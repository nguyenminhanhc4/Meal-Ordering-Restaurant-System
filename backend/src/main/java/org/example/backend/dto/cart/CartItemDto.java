package org.example.backend.dto.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.example.backend.entity.cart.CartItem;

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

    public CartItemDto(CartItem entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.menuItemId = entity.getMenuItem().getId();
            this.quantity = entity.getQuantity();
            this.menuItemName = entity.getMenuItem().getName();
            this.avatarUrl = entity.getMenuItem().getAvatarUrl();
        }
    }
}
