package org.example.backend.repository.order;

import org.example.backend.entity.order.Order;
import org.example.backend.entity.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByPublicId(String publicId);

    @EntityGraph(attributePaths = {"orderItems", "status"})
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
