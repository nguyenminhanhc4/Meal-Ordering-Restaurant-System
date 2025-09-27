package org.example.backend.repository.order;

import org.example.backend.entity.order.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByPublicId(String publicId);
}
