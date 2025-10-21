package org.example.backend.dto.order;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Data
@Builder
public class OrderResponseDTO {
    private Long id;
    private String publicId;
    private String userName;
    private String userEmail;
    private String status;
    private BigDecimal totalAmount;
    private String paymentStatus;
    private String paymentMethod;
    private String shippingAddress;
    private String shippingPhone;
    private String shippingNote;
    private LocalDateTime createdAt;
    private List<OrderItemDto> items;
}
