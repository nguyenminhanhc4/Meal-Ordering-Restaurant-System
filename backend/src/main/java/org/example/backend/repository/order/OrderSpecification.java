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

    public static Specification<Order> forStaffReview() {
        return (root, query, cb) -> {
            // Join đến payment và các bảng con
            Join<Object, Object> paymentJoin = root.join("payment", JoinType.LEFT);
            Join<Object, Object> methodJoin = paymentJoin.join("paymentMethod", JoinType.LEFT);
            Join<Object, Object> statusJoin = paymentJoin.join("status", JoinType.LEFT);

            // Điều kiện:
            // COD + PENDING  hoặc  ONLINE + COMPLETED
            return cb.or(
                    cb.and(
                            cb.equal(methodJoin.get("code"), "COD"),
                            cb.equal(statusJoin.get("code"), "PENDING")
                    ),
                    cb.and(
                            cb.equal(methodJoin.get("code"), "ONLINE"),
                            cb.equal(statusJoin.get("code"), "COMPLETED")
                    )
            );
        };
    }

}

