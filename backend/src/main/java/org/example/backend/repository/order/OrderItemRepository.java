package org.example.backend.repository.order;

import org.example.backend.entity.order.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    // Get best-selling menu items
    @Query(value = """
    SELECT 
        mi.id AS menuItemId,
        mi.name AS menuItemName,
        SUM(oi.quantity) AS totalQuantitySold,
        SUM(oi.quantity * oi.price) AS totalRevenue,
        mi.avatar_url AS avatarUrl
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    JOIN orders o ON oi.order_id = o.id
    JOIN params s ON o.status_id = s.id
    WHERE o.created_at BETWEEN :startDate AND :endDate
      AND s.type = 'ORDER_STATUS'
      AND s.code = 'DELIVERED'
    GROUP BY mi.id, mi.name, mi.avatar_url
    ORDER BY totalQuantitySold DESC
    LIMIT :limit
    """, nativeQuery = true)
    List<Map<String, Object>> getBestSellingMenuItems(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("limit") int limit);


    // Get worst-selling (flop) menu items
    @Query(value = """
    SELECT 
        mi.id AS menuItemId,
        mi.name AS menuItemName,
        COALESCE(SUM(oi.quantity), 0) AS totalQuantitySold,
        COALESCE(SUM(oi.quantity * oi.price), 0) AS totalRevenue,
        mi.avatar_url AS avatarUrl
    FROM menu_items mi
    LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
    LEFT JOIN orders o ON oi.order_id = o.id
    LEFT JOIN params s ON o.status_id = s.id
    WHERE mi.status_id = (
        SELECT id FROM params WHERE type = 'MENU_ITEM_STATUS' AND code = 'AVAILABLE'
    )
    AND (
        o.created_at BETWEEN :startDate AND :endDate
        OR o.created_at IS NULL
    )
    AND (
        s.type = 'ORDER_STATUS' AND s.code = 'DELIVERED'
        OR s.id IS NULL
    )
    GROUP BY mi.id, mi.name, mi.avatar_url
    ORDER BY totalQuantitySold ASC
    LIMIT :limit
    """, nativeQuery = true)
    List<Map<String, Object>> getWorstSellingMenuItems(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("limit") int limit);

}
