package org.example.backend.dto.payment;

import lombok.*;
import org.example.backend.entity.payment.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDto {

    private Long id;
    private Long orderId;
    private String paymentMethod;
    private BigDecimal amount;
    private String status;
    private String transactionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PaymentDto(Payment payment) {
        this.id = payment.getId();
        this.orderId = payment.getOrder().getId();
        this.paymentMethod = payment.getPaymentMethod() != null ? payment.getPaymentMethod().getCode() : null;
        this.amount = payment.getAmount();
        this.status = payment.getStatus() != null ? payment.getStatus().getCode() : null;
        this.transactionId = payment.getTransactionId();
        this.createdAt = payment.getCreatedAt();
        this.updatedAt = payment.getUpdatedAt();
    }
}
