package org.example.backend.repository.order;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.example.backend.entity.order.Order;
import org.example.backend.entity.param.Param;
import org.example.backend.entity.user.User;
import org.springframework.data.jpa.domain.Specification;

public class OrderSpecification {
    public static Specification<Order> hasStatus(String statusCode) {
        return (root, query, cb) -> {
            if (statusCode == null) return cb.conjunction();
            Join<Order, Param> statusJoin = root.join("status", JoinType.LEFT);
            return cb.equal(statusJoin.get("code"), statusCode);
        };
    }

    public static Specification<Order> keywordSearch(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null) return cb.conjunction();
            Join<Order, User> userJoin = root.join("user", JoinType.LEFT);
            return cb.or(
                    cb.like(cb.lower(userJoin.get("name")), "%" + keyword.toLowerCase() + "%"),
                    cb.like(cb.lower(userJoin.get("email")), "%" + keyword.toLowerCase() + "%")
            );
        };
    }
}

