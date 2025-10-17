package org.example.backend.service.order;

import lombok.RequiredArgsConstructor;
import org.example.backend.entity.menu.MenuItem;
import org.example.backend.entity.order.Order;
import org.example.backend.entity.order.OrderItem;
import org.example.backend.entity.param.Param;
import org.example.backend.repository.order.OrderRepository;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OrderHistoryService {

    private final OrderRepository orderRepository;

    public Page<Order> getOrderHistory(Long userId,
                                       String keyword,
                                       String status,
                                       LocalDate fromDate,
                                       LocalDate toDate,
                                       Pageable pageable) {

        Specification<Order> spec = (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (userId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("user").get("id"), userId));
            }

            if (status != null && !status.isEmpty()) {
                Join<Order, Param> statusJoin = root.join("status");
                predicate = cb.and(predicate, cb.equal(statusJoin.get("code"), status));

            }

            if (fromDate != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate.atStartOfDay()));
            }

            if (toDate != null) {
                predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("createdAt"), toDate.atTime(23, 59, 59)));
            }

            if (keyword != null && !keyword.isEmpty()) {
                Join<?, ?> items = root.join("orderItems", JoinType.LEFT);
                Join<?, ?> menu = items.join("menuItem", JoinType.LEFT);
                query.distinct(true);
                predicate = cb.and(predicate, cb.like(cb.lower(menu.get("name")), "%" + keyword.toLowerCase() + "%"));
            }

            return predicate;
        };


        return orderRepository.findAll(spec, pageable);
    }

    private Specification<Order> belongsToUser(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }

    private Specification<Order> hasStatus(String status) {
        if (status == null || status.isEmpty()) return null;
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    private Specification<Order> createdBetween(LocalDate from, LocalDate to) {
        if (from == null && to == null) return null;
        return (root, query, cb) -> {
            Path<LocalDateTime> createdAt = root.get("createdAt");
            if (from != null && to != null)
                return cb.between(createdAt, from.atStartOfDay(), to.atTime(23, 59, 59));
            if (from != null)
                return cb.greaterThanOrEqualTo(createdAt, from.atStartOfDay());
            return cb.lessThanOrEqualTo(createdAt, to.atTime(23, 59, 59));
        };
    }

    private Specification<Order> containsMenuItem(String keyword) {
        if (keyword == null || keyword.isEmpty()) return null;
        return (root, query, cb) -> {
            Join<Order, OrderItem> items = root.join("orderItems", JoinType.LEFT);
            Join<OrderItem, MenuItem> menu = items.join("menuItem", JoinType.LEFT);
            query.distinct(true);
            return cb.like(cb.lower(menu.get("name")), "%" + keyword.toLowerCase() + "%");
        };
    }
}
