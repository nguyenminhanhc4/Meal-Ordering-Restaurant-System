package org.example.backend.dto.cart;

import lombok.*;
import org.example.backend.entity.cart.Cart;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDto {
    private Long id;
    private Long userId;   // khóa ngoại tới User
    private String status; // code của status (ví dụ ACTIVE / CHECKED_OUT)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CartItemDto> items;
    private List<CartComboItemDto> combos;

    public CartDto(Cart entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.userId = entity.getUser().getId();
            this.status = entity.getStatus() != null ? entity.getStatus().getCode() : null;
            this.createdAt = entity.getCreatedAt();
            this.updatedAt = entity.getUpdatedAt();
            if (entity.getItems() != null) {
                this.items = entity.getItems()
                        .stream()
                        .map(CartItemDto::new)
                        .toList();
            }
            if (entity.getComboItems() != null) {
                this.combos = entity.getComboItems()
                        .stream()
                        .map(CartComboItemDto::new)
                        .toList();
            }
        }
    }

    public BigDecimal getTotalAmount() {
        BigDecimal itemTotal = (items == null || items.isEmpty()) ? BigDecimal.ZERO :
                items.stream()
                        .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal comboTotal = (combos == null || combos.isEmpty()) ? BigDecimal.ZERO :
                combos.stream()
                        .map(c -> c.getPrice().multiply(BigDecimal.valueOf(c.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        return itemTotal.add(comboTotal);
    }

}
