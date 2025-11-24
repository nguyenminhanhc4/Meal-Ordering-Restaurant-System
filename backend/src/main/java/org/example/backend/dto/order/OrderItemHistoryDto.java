package org.example.backend.dto.order;

import lombok.*;
import org.example.backend.entity.order.OrderItem;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemHistoryDto {
    private Long menuItemId;
    private String menuItemName;
    private Long comboId;
    private String comboName;
    private String imageUrl;
    private String status;
    private int quantity;
    private BigDecimal price;

    public static OrderItemHistoryDto fromEntity(OrderItem item) {
        if (item == null) return null;

        Long menuItemId = null;
        String menuItemName = null;
        Long comboId = null;
        String comboName = null;
        String imageUrl = null;
        String status = null;

        if (item.getMenuItem() != null) {
            menuItemId = item.getMenuItem().getId();
            menuItemName = item.getMenuItem().getName();
            imageUrl = item.getMenuItem().getAvatarUrl();
            status = item.getMenuItem().getStatus() != null
                    ? item.getMenuItem().getStatus().getCode()
                    : null;
        } else if (item.getCombo() != null) {
            comboId = item.getCombo().getId();
            comboName = item.getCombo().getName();
            imageUrl = item.getCombo().getAvatarUrl(); // nếu combo có ảnh riêng
            status = item.getCombo().getStatus() != null
                    ? item.getCombo().getStatus().getCode()
                    : null;
        }

        return new OrderItemHistoryDto(
                menuItemId,
                menuItemName,
                comboId,
                comboName,
                imageUrl,
                status,
                item.getQuantity(),
                item.getPrice()
        );
    }

}
