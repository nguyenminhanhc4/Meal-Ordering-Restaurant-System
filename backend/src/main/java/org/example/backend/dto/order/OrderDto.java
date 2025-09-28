package org.example.backend.dto.order;

import lombok.*;
import org.example.backend.entity.order.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {

    private Long id;
    private String publicId;
    private Long userId;
    private String userName;
    private String status;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemDto> orderItems;

    public OrderDto(Order entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.publicId = entity.getPublicId();
            this.userId = entity.getUser().getId();
            this.userName = entity.getUser().getName();
            this.status = entity.getStatus() != null ? entity.getStatus().getCode() : null;
            this.totalAmount = entity.getTotalAmount();
            this.createdAt = entity.getCreatedAt();
            this.updatedAt = entity.getUpdatedAt();
            this.orderItems = entity.getOrderItems() != null
                    ? entity.getOrderItems().stream().map(OrderItemDto::new).collect(Collectors.toList())
                    : null;
        }
    }
}
