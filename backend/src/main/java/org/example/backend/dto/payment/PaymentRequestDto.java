package org.example.backend.dto.payment;

import lombok.Data;

@Data
public class PaymentRequestDto {
    private Long orderId;
    private String paymentMethodCode;
    // Thông tin giao hàng
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String note; // có thể null
}

