package org.example.backend.repository.order;

import org.example.backend.entity.order.Order;
import org.example.backend.entity.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByPublicId(String publicId);

    @EntityGraph(attributePaths = {"orderItems", "status"})
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    // Revenue statistics by day
    @Query(value = "SELECT DATE(o.created_at) as period, " +
            "SUM(o.total_amount) as totalRevenue, " +
            "COUNT(o.id) as totalOrders " +
            "FROM orders o " +
            "WHERE o.created_at BETWEEN :startDate AND :endDate " +
            "AND o.status_id = (SELECT id FROM params WHERE type = 'ORDER_STATUS' AND code = 'PAID') " +
            "GROUP BY DATE(o.created_at) " +
            "ORDER BY period DESC", nativeQuery = true)
    List<Map<String, Object>> getRevenueStatisticsByDay(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Revenue statistics by month
    @Query(value = "SELECT DATE_FORMAT(o.created_at, '%Y-%m') as period, " +
            "SUM(o.total_amount) as totalRevenue, " +
            "COUNT(o.id) as totalOrders " +
            "FROM orders o " +
            "WHERE o.created_at BETWEEN :startDate AND :endDate " +
            "AND o.status_id = (SELECT id FROM params WHERE type = 'ORDER_STATUS' AND code = 'PAID') " +
            "GROUP BY DATE_FORMAT(o.created_at, '%Y-%m') " +
            "ORDER BY period DESC", nativeQuery = true)
    List<Map<String, Object>> getRevenueStatisticsByMonth(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Revenue statistics by year
    @Query(value = "SELECT YEAR(o.created_at) as period, " +
            "SUM(o.total_amount) as totalRevenue, " +
            "COUNT(o.id) as totalOrders " +
            "FROM orders o " +
            "WHERE o.created_at BETWEEN :startDate AND :endDate " +
            "AND o.status_id = (SELECT id FROM params WHERE type = 'ORDER_STATUS' AND code = 'PAID') " +
            "GROUP BY YEAR(o.created_at) " +
            "ORDER BY period DESC", nativeQuery = true)
    List<Map<String, Object>> getRevenueStatisticsByYear(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
