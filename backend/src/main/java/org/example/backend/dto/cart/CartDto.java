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

    public CartDto(Cart entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.userId = entity.getUser().getId();
            this.status = entity.getStatus() != null ? entity.getStatus().getCode() : null;
            this.createdAt = entity.getCreatedAt();
            this.updatedAt = entity.getUpdatedAt();if (entity.getItems() != null) {
                this.items = entity.getItems()
                        .stream()
                        .map(CartItemDto::new)
                        .toList();
            }
        }
    }

    public BigDecimal getTotalAmount() {
        if (items == null || items.isEmpty()) return BigDecimal.ZERO;
        return items.stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
