package org.example.backend.repository;

import org.example.backend.entity.Order;
import org.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByPublicId(String publicId);

    List<Order> getOrderByUser(User user);
}
