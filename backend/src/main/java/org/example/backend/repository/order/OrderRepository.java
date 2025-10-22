package org.example.backend.repository.order;

import org.example.backend.entity.order.Order;
import org.example.backend.entity.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    @Query("""
    SELECT o FROM Order o
    LEFT JOIN o.payment p
    LEFT JOIN p.paymentMethod m
    LEFT JOIN p.shippingInfo s
    LEFT JOIN o.user u
    WHERE (:keyword IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
      AND (:status IS NULL OR o.status.code = :status)
      AND (:paymentStatus IS NULL OR p.status.code = :paymentStatus)
    ORDER BY 
      CASE o.status.code
        WHEN 'PENDING' THEN 1
        WHEN 'APPROVED' THEN 2
        WHEN 'DELIVERING' THEN 3
        WHEN 'DELIVERED' THEN 4
        WHEN 'COMPLETED' THEN 5
        WHEN 'CANCELLED' THEN 6
        ELSE 7
      END,
      CASE p.status.code
        WHEN 'PENDING' THEN 1
        WHEN 'COMPLETED' THEN 2
        WHEN 'FAILED' THEN 3
        ELSE 4
      END,
      CASE m.code
        WHEN 'COD' THEN 1
        WHEN 'ONLINE' THEN 2
        ELSE 3
      END,
      o.createdAt DESC
""")
    Page<Order> findAllWithCustomSort(
            @Param("status") String status,
            @Param("paymentStatus") String paymentStatus,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {
            "user",
            "status",
            "payment",
            "payment.shippingInfo",
            "orderItems",
            "orderItems.menuItem",
            "orderItems.combo"
    })
    Optional<Order> findByPublicId(String publicId);

//    Optional<Order> findByPublicId(String publicId);

    @EntityGraph(attributePaths = {"orderItems", "status"})
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    // Revenue statistics by day
    @Query(value = """
    SELECT 
        DATE(o.created_at) AS period,
        SUM(o.total_amount) AS totalRevenue,
        COUNT(o.id) AS totalOrders
    FROM orders o
    JOIN params s ON o.status_id = s.id
    WHERE o.created_at BETWEEN :startDate AND :endDate
      AND s.type = 'ORDER_STATUS'
      AND s.code = 'DELIVERED'
    GROUP BY DATE(o.created_at)
    ORDER BY period DESC
    """, nativeQuery = true)
    List<Map<String, Object>> getRevenueStatisticsByDay(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);


    // Revenue statistics by month
    @Query(value = """
    SELECT 
        DATE_FORMAT(o.created_at, '%Y-%m') AS period,
        SUM(o.total_amount) AS totalRevenue,
        COUNT(o.id) AS totalOrders
    FROM orders o
    JOIN params s ON o.status_id = s.id
    WHERE o.created_at BETWEEN :startDate AND :endDate
      AND s.type = 'ORDER_STATUS'
      AND s.code = 'DELIVERED'
    GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
    ORDER BY period DESC
    """, nativeQuery = true)
    List<Map<String, Object>> getRevenueStatisticsByMonth(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);


    // Revenue statistics by year
    @Query(value = """
    SELECT 
        YEAR(o.created_at) AS period,
        SUM(o.total_amount) AS totalRevenue,
        COUNT(o.id) AS totalOrders
    FROM orders o
    JOIN params s ON o.status_id = s.id
    WHERE o.created_at BETWEEN :startDate AND :endDate
      AND s.type = 'ORDER_STATUS'
      AND s.code = 'DELIVERED'
    GROUP BY YEAR(o.created_at)
    ORDER BY period DESC
    """, nativeQuery = true)
    List<Map<String, Object>> getRevenueStatisticsByYear(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

}
