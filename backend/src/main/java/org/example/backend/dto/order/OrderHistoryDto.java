package org.example.backend.dto.order;

import lombok.*;
import org.example.backend.entity.order.Order;
import org.example.backend.entity.param.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderHistoryDto {
    private Long id;
    private LocalDateTime createdAt;
    private String status;
    private BigDecimal totalAmount;
    private List<OrderItemHistoryDto> items;

    public static OrderHistoryDto fromEntity(Order order) {
        return new OrderHistoryDto(
                order.getId(),
                order.getCreatedAt(),
                order.getStatus().getCode(),
                order.getTotalAmount(),
                order.getOrderItems().stream()
                        .map(OrderItemHistoryDto::fromEntity)
                        .collect(Collectors.toList())
        );
    }
}
