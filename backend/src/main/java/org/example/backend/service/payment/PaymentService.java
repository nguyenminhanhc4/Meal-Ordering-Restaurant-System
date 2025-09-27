package org.example.backend.service.payment;

import lombok.RequiredArgsConstructor;
import org.example.backend.entity.param.Param;
import org.example.backend.entity.payment.Payment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.example.backend.dto.payment.PaymentDto;
import org.example.backend.repository.payment.PaymentRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentDto createPayment(Payment payment) {
        return new PaymentDto(paymentRepository.save(payment));
    }

    public Optional<PaymentDto> getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId);
        return payment != null ? Optional.of(new PaymentDto(payment)) : Optional.empty();
    }

    public PaymentDto updatePaymentStatus(Long id, Param status, String transactionId) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setStatus(status);
        payment.setTransactionId(transactionId);
        return new PaymentDto(paymentRepository.save(payment));
    }
}
