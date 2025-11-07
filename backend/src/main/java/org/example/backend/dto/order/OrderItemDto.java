package org.example.backend.dto.order;

import lombok.*;
import org.example.backend.entity.order.OrderItem;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDto {

    private Long id;
    private Long menuItemId;
    private Long comboId;
    private String menuItemName;
    private String comboName;
    private Integer quantity;
    private BigDecimal price;

    public OrderItemDto(OrderItem entity) {
        if (entity != null) {
            this.id = entity.getId();

            if (entity.getCombo() != null) {
                this.comboId = entity.getCombo().getId();
                this.comboName = entity.getCombo().getName();
            }

            if (entity.getMenuItem() != null) {
                this.menuItemId = entity.getMenuItem().getId();
                this.menuItemName = entity.getMenuItem().getName();
            }

            this.quantity = entity.getQuantity();
            this.price = entity.getPrice();
        }
    }

}
