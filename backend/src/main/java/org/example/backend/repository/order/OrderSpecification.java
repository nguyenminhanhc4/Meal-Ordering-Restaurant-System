package org.example.backend.repository.order;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.example.backend.entity.order.Order;
import org.example.backend.entity.param.Param;
import org.example.backend.entity.payment.Payment;
import org.example.backend.entity.user.User;
import org.springframework.data.jpa.domain.Specification;

public class OrderSpecification {
    public static Specification<Order> hasStatus(String statusCode) {
        return (root, query, cb) -> {
            if (statusCode == null || statusCode.isBlank()) return cb.conjunction();
            Join<Order, Param> statusJoin = root.join("status", JoinType.LEFT);
            return cb.equal(statusJoin.get("code"), statusCode);
        };
    }

    public static Specification<Order> hasPaymentStatus(String paymentStatusCode) {
        return (root, query, cb) -> {
            if (paymentStatusCode == null) return cb.conjunction();
            Join<Order, Payment> paymentJoin = root.join("payment", JoinType.LEFT);
            Join<Payment, Param> paymentStatusJoin = paymentJoin.join("status", JoinType.LEFT);
            return cb.equal(paymentStatusJoin.get("code"), paymentStatusCode);
        };
    }

    public static Specification<Order> keywordSearch(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return cb.conjunction();
            String pattern = "%" + keyword.toLowerCase() + "%";
            Join<Order, User> userJoin = root.join("user", JoinType.LEFT);
            return cb.or(
                    cb.like(cb.lower(userJoin.get("name")), pattern),
                    cb.like(cb.lower(userJoin.get("email")), pattern),
                    cb.like(cb.lower(root.get("publicId")), pattern)
            );
        };
    }

    public static Specification<Order> forStaffReview() {
        return (root, query, cb) -> {
            // Join đến payment và các bảng con
            Join<Object, Object> paymentJoin = root.join("payment", JoinType.LEFT);
            Join<Object, Object> methodJoin = paymentJoin.join("paymentMethod", JoinType.LEFT);
            Join<Object, Object> statusJoin = paymentJoin.join("status", JoinType.LEFT);

            var validPayment = cb.or(
                    cb.and(
                            cb.equal(methodJoin.get("code"), "COD"),
                            statusJoin.get("code").in("PENDING", "COMPLETED") // COD chưa hoặc đã thanh toán
                    ),
                    cb.and(
                            cb.equal(methodJoin.get("code"), "ONLINE"),
                            cb.equal(statusJoin.get("code"), "COMPLETED") // Online đã thanh toán xong
                    )
            );
            return cb.and(validPayment);
        };
    }

}

