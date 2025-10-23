package org.example.backend.repository.reservation;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.example.backend.entity.reservation.Reservation;
import org.example.backend.entity.table.TableEntity;
import org.example.backend.entity.user.User;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class ReservationSpecification {

    // Filter theo status
    public static Specification<Reservation> hasStatus(Long statusId) {
        return (root, query, cb) -> {
            if (statusId == null) return null;
            return cb.equal(root.get("status").get("id"), statusId);
        };
    }

    // Search theo username hoặc note
    public static Specification<Reservation> containsKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isEmpty()) return null;

            String likePattern = "%" + keyword.toLowerCase() + "%";

            // Join User entity
            Join<Reservation, User> userJoin = root.join("user", JoinType.LEFT);

            // Join Tables entity
            Join<Reservation, TableEntity> tableJoin = root.join("tables", JoinType.LEFT);
            // Nếu trong entity là List<Table> tables thì dùng joinList

            return cb.or(
                    cb.like(cb.lower(root.get("publicId")), likePattern),          // tìm theo reservationId
                    cb.like(cb.lower(userJoin.get("name")), likePattern),           // tìm theo tên user
                    cb.like(cb.lower(userJoin.get("email")), likePattern),          // email user
                    cb.like(cb.lower(userJoin.get("phone")), likePattern),          // phone user
                    cb.like(cb.lower(tableJoin.get("name")), likePattern)          // tên bàn
            );
        };
    }

    // Filter theo khoảng thời gian
    public static Specification<Reservation> reservationBetween(LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return null;
            if (from != null && to != null) {
                return cb.between(root.get("reservationTime"), from, to);
            } else if (from != null) {
                return cb.greaterThanOrEqualTo(root.get("reservationTime"), from);
            } else {
                return cb.lessThanOrEqualTo(root.get("reservationTime"), to);
            }
        };
    }

    // Filter theo số người
    public static Specification<Reservation> numberOfPeopleEquals(Integer numberOfPeople) {
        return (root, query, cb) -> {
            if (numberOfPeople == null) return null;
            return cb.equal(root.get("numberOfPeople"), numberOfPeople);
        };
    }

}
