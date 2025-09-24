package org.example.backend.dto;

import lombok.*;
import org.example.backend.entity.OrderItem;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDto {

    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private Integer quantity;
    private BigDecimal price;

    public OrderItemDto(OrderItem entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.menuItemId = entity.getMenuItem().getId();
            this.menuItemName = entity.getMenuItem().getName();
            this.quantity = entity.getQuantity();
            this.price = entity.getPrice();
        }
    }
}
