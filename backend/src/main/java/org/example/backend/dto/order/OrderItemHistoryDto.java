package org.example.backend.dto.order;

import lombok.*;
import org.example.backend.entity.order.OrderItem;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemHistoryDto {
    private String menuItemName;
    private String imageUrl;
    private int quantity;
    private BigDecimal price;

    public static OrderItemHistoryDto fromEntity(OrderItem item) {
        return new OrderItemHistoryDto(
                item.getMenuItem().getName(),
                item.getMenuItem().getAvatarUrl(),
                item.getQuantity(),
                item.getPrice()
        );
    }
}
