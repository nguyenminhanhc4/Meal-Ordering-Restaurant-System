package org.example.backend.repository.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.example.backend.entity.payment.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Payment findByOrderId(Long orderId);
}
