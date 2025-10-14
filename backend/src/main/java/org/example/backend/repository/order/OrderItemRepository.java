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
    @Query(value = "SELECT mi.id as menuItemId, " +
            "mi.name as menuItemName, " +
            "SUM(oi.quantity) as totalQuantitySold, " +
            "SUM(oi.quantity * oi.price) as totalRevenue, " +
            "mi.avatar_url as avatarUrl " +
            "FROM order_items oi " +
            "JOIN menu_items mi ON oi.menu_item_id = mi.id " +
            "JOIN orders o ON oi.order_id = o.id " +
            "WHERE o.created_at BETWEEN :startDate AND :endDate " +
            "AND o.status_id = (SELECT id FROM params WHERE type = 'ORDER_STATUS' AND code = 'PAID') " +
            "GROUP BY mi.id, mi.name, mi.avatar_url " +
            "ORDER BY totalQuantitySold DESC " +
            "LIMIT :limit", nativeQuery = true)
    List<Map<String, Object>> getBestSellingMenuItems(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("limit") int limit);

    // Get worst-selling menu items (flop)
    @Query(value = "SELECT mi.id as menuItemId, " +
            "mi.name as menuItemName, " +
            "COALESCE(SUM(oi.quantity), 0) as totalQuantitySold, " +
            "COALESCE(SUM(oi.quantity * oi.price), 0) as totalRevenue, " +
            "mi.avatar_url as avatarUrl " +
            "FROM menu_items mi " +
            "LEFT JOIN order_items oi ON mi.id = oi.menu_item_id " +
            "AND oi.order_id IN (SELECT o.id FROM orders o " +
            "WHERE o.created_at BETWEEN :startDate AND :endDate " +
            "AND o.status_id = (SELECT id FROM params WHERE type = 'ORDER_STATUS' AND code = 'PAID')) " +
            "WHERE mi.status_id = (SELECT id FROM params WHERE type = 'MENU_ITEM_STATUS' AND code = 'AVAILABLE') " +
            "GROUP BY mi.id, mi.name, mi.avatar_url " +
            "ORDER BY totalQuantitySold ASC " +
            "LIMIT :limit", nativeQuery = true)
    List<Map<String, Object>> getWorstSellingMenuItems(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("limit") int limit);
}
