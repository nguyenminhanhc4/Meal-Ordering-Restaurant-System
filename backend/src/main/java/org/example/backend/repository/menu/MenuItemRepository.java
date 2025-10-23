package org.example.backend.repository.menu;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.example.backend.entity.menu.MenuItem;
import org.example.backend.entity.cart.CartItem;
import org.example.backend.entity.order.OrderItem;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;


public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    @Query("""
SELECT m,
       c.name AS categoryName,
       LOWER(REPLACE(c.name, ' ', '-')) AS categorySlug,
       p.code AS status,
       (SELECT COALESCE(AVG(r.rating), 0)
        FROM Review r
        WHERE r.menuItem.id = m.id) AS rating,
       (SELECT COALESCE(SUM(oi.quantity), 0)
        FROM OrderItem oi
        JOIN oi.order o
        WHERE oi.menuItem.id = m.id
          AND o.status.code = 'DELIVERED') AS sold
FROM MenuItem m
LEFT JOIN m.category c
LEFT JOIN m.status p
GROUP BY m.id, c.name, p.code
""")
    Page<Object[]> findAllWithDetails(Pageable pageable);

    @Query("""
SELECT m,
       c.name AS categoryName,
       LOWER(REPLACE(c.name, ' ', '-')) AS categorySlug,
       p.code AS status,
       (SELECT COALESCE(AVG(r.rating), 0)
        FROM Review r
        WHERE r.menuItem.id = m.id) AS rating,
       (SELECT COALESCE(SUM(oi.quantity), 0)
        FROM OrderItem oi
        JOIN oi.order o
        WHERE oi.menuItem.id = m.id
          AND o.status.code = 'DELIVERED') AS sold
FROM MenuItem m
LEFT JOIN m.category c
LEFT JOIN m.status p
GROUP BY m.id, c.name, p.code
            ORDER BY
            CASE WHEN m.createdAt > :newThreshold THEN 1 ELSE 0 END DESC,
            CASE WHEN p.code = 'OUT_OF_STOCK' THEN 1 ELSE 0 END ASC,
            (SELECT COALESCE(SUM(oi.quantity), 0)
            FROM OrderItem oi
            JOIN oi.order o
            WHERE oi.menuItem.id = m.id
            AND o.status.code = 'DELIVERED') DESC 
""")
    Page<Object[]> findAllWithDetailsOrdered(@Param("newThreshold") LocalDateTime newThreshold, Pageable pageable);

    @Query("""
SELECT m,
       c.name AS categoryName,
       LOWER(REPLACE(c.name, ' ', '-')) AS categorySlug,
       p.code AS status,
       (SELECT COALESCE(AVG(r.rating), 0)
        FROM Review r
        WHERE r.menuItem.id = m.id) AS rating,
       (SELECT COALESCE(SUM(oi.quantity), 0)
        FROM OrderItem oi
        JOIN oi.order o
        WHERE oi.menuItem.id = m.id
          AND o.status.code = 'DELIVERED') AS sold
FROM MenuItem m
LEFT JOIN m.category c
LEFT JOIN m.status p
GROUP BY m.id, c.name, p.code
ORDER BY sold DESC
""")
    List<Object[]> findTopPopular(Pageable pageable);

    @Query("""
SELECT m,
       c.name AS categoryName,
       LOWER(REPLACE(c.name, ' ', '-')) AS categorySlug,
       p.code AS status,
       (SELECT COALESCE(AVG(r.rating), 0)
        FROM Review r
        WHERE r.menuItem.id = m.id) AS rating,
       (SELECT COALESCE(SUM(oi.quantity), 0)
        FROM OrderItem oi
        JOIN oi.order o
        WHERE oi.menuItem.id = m.id
          AND o.status.code = 'DELIVERED') AS sold
FROM MenuItem m
LEFT JOIN m.category c
LEFT JOIN m.status p
WHERE LOWER(m.name) LIKE LOWER(:search)
GROUP BY m.id, c.name, p.code
""")
    Page<Object[]> findAllWithDetailsByNameContainingIgnoreCase(@Param("search") String search, Pageable pageable);

    // 🧩 Lọc theo categorySlug
    @Query("""
SELECT m,
       c.name AS categoryName,
       LOWER(REPLACE(c.name, ' ', '-')) AS categorySlug,
       p.code AS status,
       (SELECT COALESCE(AVG(r.rating), 0)
        FROM Review r
        WHERE r.menuItem.id = m.id) AS rating,
       (SELECT COALESCE(SUM(oi.quantity), 0)
        FROM OrderItem oi
        JOIN oi.order o
        WHERE oi.menuItem.id = m.id
          AND o.status.code = 'DELIVERED') AS sold
FROM MenuItem m
LEFT JOIN m.category c
LEFT JOIN m.status p
WHERE LOWER(REPLACE(c.name, ' ', '-')) = LOWER(:categorySlug)
GROUP BY m.id, c.name, p.code
""")
    Page<Object[]> findAllWithDetailsByCategory(@Param("categorySlug") String categorySlug, Pageable pageable);

    // 🧩 Lọc theo categorySlug + search
    @Query("""
SELECT m,
       c.name AS categoryName,
       LOWER(REPLACE(c.name, ' ', '-')) AS categorySlug,
       p.code AS status,
       (SELECT COALESCE(AVG(r.rating), 0)
        FROM Review r
        WHERE r.menuItem.id = m.id) AS rating,
       (SELECT COALESCE(SUM(oi.quantity), 0)
        FROM OrderItem oi
        JOIN oi.order o
        WHERE oi.menuItem.id = m.id
          AND o.status.code = 'DELIVERED') AS sold
FROM MenuItem m
LEFT JOIN m.category c
LEFT JOIN m.status p
WHERE LOWER(REPLACE(c.name, ' ', '-')) = LOWER(:categorySlug)
  AND LOWER(m.name) LIKE LOWER(:search)
GROUP BY m.id, c.name, p.code
""")
    Page<Object[]> findAllWithDetailsByCategoryAndName(
            @Param("categorySlug") String categorySlug,
            @Param("search") String search,
            Pageable pageable);

    // ===========================================
    // ADMIN Search Method with Filters
    // ===========================================
    @Query("""
SELECT m,
       c.name AS categoryName,
       LOWER(REPLACE(c.name, ' ', '-')) AS categorySlug,
       p.code AS status,
       (SELECT COALESCE(AVG(r.rating), 0)
        FROM Review r
        WHERE r.menuItem.id = m.id) AS rating,
       (SELECT COALESCE(SUM(oi.quantity), 0)
        FROM OrderItem oi
        JOIN oi.order o
        WHERE oi.menuItem.id = m.id
          AND o.status.code = 'DELIVERED') AS sold
FROM MenuItem m
LEFT JOIN m.category c
LEFT JOIN m.status p
WHERE (:name IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :name, '%')))
  AND (:description IS NULL OR LOWER(m.description) LIKE LOWER(CONCAT('%', :description, '%')))
  AND (:categoryId IS NULL OR c.id = :categoryId)
  AND (:statusId IS NULL OR p.id = :statusId)
  AND (:minPrice IS NULL OR m.price >= :minPrice)
  AND (:maxPrice IS NULL OR m.price <= :maxPrice)
GROUP BY m.id, c.name, p.code
""")
    Page<Object[]> searchMenuItemsWithFilters(
            @Param("name") String name,
            @Param("description") String description,
            @Param("categoryId") Long categoryId,
            @Param("statusId") Long statusId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);

    // Check if menu item is used in cart_items (for delete constraint)
    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.menuItem.id = :menuItemId")
    Long countMenuItemInCartItems(@Param("menuItemId") Long menuItemId);

    // Check if menu item is used in order_items (for delete constraint)
    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.menuItem.id = :menuItemId")
    Long countMenuItemInOrderItems(@Param("menuItemId") Long menuItemId);
}
