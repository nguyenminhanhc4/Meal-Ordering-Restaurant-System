package org.example.backend.dto;

import lombok.*;
import org.example.backend.entity.CartItem;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDto {

    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private Integer quantity;

    public CartItemDto(CartItem entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.menuItemId = entity.getMenuItem().getId();
            this.menuItemName = entity.getMenuItem().getName();
            this.quantity = entity.getQuantity();
        }
    }
}
