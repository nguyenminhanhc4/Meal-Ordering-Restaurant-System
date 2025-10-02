package org.example.backend.repository.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.example.backend.entity.payment.Payment;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByPublicId(String publicId);
}
