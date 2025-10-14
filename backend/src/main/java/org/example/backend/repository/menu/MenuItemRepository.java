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
import java.util.List;


public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    @Query(value = "SELECT m, " +
            "c.name AS categoryName, " +
            "LOWER(REPLACE(c.name, ' ', '-')) AS categorySlug, " +
            "p.code AS status, " +
            "COALESCE(AVG(r.rating), 0) AS rating, " +
            "COALESCE(SUM(oi.quantity), 0) AS sold " +
            "FROM MenuItem m " +
            "LEFT JOIN m.category c " +
            "LEFT JOIN m.status p " +
            "LEFT JOIN m.reviews r " +
            "LEFT JOIN OrderItem oi ON m.id = oi.menuItem.id " +
            "LEFT JOIN oi.order o ON o.status.code = 'PAID' " +
            "GROUP BY m.id, c.name, p.code",
            countQuery = "SELECT COUNT(m) FROM MenuItem m")
    Page<Object[]> findAllWithDetails(Pageable pageable);

    @Query("SELECT m, " +
            "c.name AS categoryName, " +
            "LOWER(REPLACE(c.name, ' ', '-')) AS categorySlug, " +
            "p.code AS status, " +
            "COALESCE(AVG(r.rating), 0) AS rating, " +
            "COALESCE(SUM(oi.quantity), 0) AS sold " +
            "FROM MenuItem m " +
            "LEFT JOIN m.category c " +
            "LEFT JOIN m.status p " +
            "LEFT JOIN m.reviews r " +
            "LEFT JOIN OrderItem oi ON m.id = oi.menuItem.id " +
            "LEFT JOIN oi.order o ON o.status.code = 'PAID' " +
            "GROUP BY m.id, c.name, p.code " +
            "ORDER BY COALESCE(SUM(oi.quantity), 0) DESC")
    List<Object[]> findTopPopular(Pageable pageable);

    @Query("""
    SELECT m,
           c.name AS categoryName,
           LOWER(REPLACE(c.name, ' ', '-')) AS categorySlug,
           p.code AS status,
           COALESCE(AVG(r.rating), 0) AS rating,
           COALESCE(SUM(oi.quantity), 0) AS sold
    FROM MenuItem m
    LEFT JOIN m.category c
    LEFT JOIN m.status p
    LEFT JOIN m.reviews r
    LEFT JOIN OrderItem oi ON m.id = oi.menuItem.id
    LEFT JOIN oi.order o ON o.status.code = 'PAID'
    WHERE LOWER(m.name) LIKE LOWER(:search)
    GROUP BY m.id, c.name, p.code
""")
    Page<Object[]> findAllWithDetailsByNameContainingIgnoreCase(@Param("search") String search, Pageable pageable);

    // 🧩 Lọc theo categorySlug
    @Query("SELECT m, c.name AS categoryName, LOWER(REPLACE(c.name, ' ', '-')) AS categorySlug, p.code AS status, "
            + "COALESCE(AVG(r.rating), 0) AS rating, COALESCE(SUM(oi.quantity), 0) AS sold "
            + "FROM MenuItem m "
            + "LEFT JOIN m.category c "
            + "LEFT JOIN m.status p "
            + "LEFT JOIN m.reviews r "
            + "LEFT JOIN OrderItem oi ON m.id = oi.menuItem.id "
            + "LEFT JOIN oi.order o ON o.status.code = 'PAID' "
            + "WHERE LOWER(REPLACE(c.name, ' ', '-')) = LOWER(:categorySlug) "
            + "GROUP BY m.id, c.name, p.code")
    Page<Object[]> findAllWithDetailsByCategory(@Param("categorySlug") String categorySlug, Pageable pageable);

    // 🧩 Lọc theo categorySlug + search
    @Query("SELECT m, c.name AS categoryName, LOWER(REPLACE(c.name, ' ', '-')) AS categorySlug, p.code AS status, "
            + "COALESCE(AVG(r.rating), 0) AS rating, COALESCE(SUM(oi.quantity), 0) AS sold "
            + "FROM MenuItem m "
            + "LEFT JOIN m.category c "
            + "LEFT JOIN m.status p "
            + "LEFT JOIN m.reviews r "
            + "LEFT JOIN OrderItem oi ON m.id = oi.menuItem.id "
            + "LEFT JOIN oi.order o ON o.status.code = 'PAID' "
            + "WHERE LOWER(REPLACE(c.name, ' ', '-')) = LOWER(:categorySlug) "
            + "AND LOWER(m.name) LIKE LOWER(:search) "
            + "GROUP BY m.id, c.name, p.code")
    Page<Object[]> findAllWithDetailsByCategoryAndName(
            @Param("categorySlug") String categorySlug,
            @Param("search") String search,
            Pageable pageable);

    // ===========================================
    // ADMIN Search Method with Filters
    // ===========================================
    @Query("SELECT m, " +
            "c.name AS categoryName, " +
            "LOWER(REPLACE(c.name, ' ', '-')) AS categorySlug, " +
            "p.code AS status, " +
            "COALESCE(AVG(r.rating), 0) AS rating, " +
            "COALESCE(SUM(oi.quantity), 0) AS sold " +
            "FROM MenuItem m " +
            "LEFT JOIN m.category c " +
            "LEFT JOIN m.status p " +
            "LEFT JOIN m.reviews r " +
            "LEFT JOIN OrderItem oi ON m.id = oi.menuItem.id " +
            "LEFT JOIN oi.order o ON o.status.code = 'PAID' " +
            "WHERE (:name IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
            "AND (:description IS NULL OR LOWER(m.description) LIKE LOWER(CONCAT('%', :description, '%'))) " +
            "AND (:categoryId IS NULL OR c.id = :categoryId) " +
            "AND (:statusId IS NULL OR p.id = :statusId) " +
            "AND (:minPrice IS NULL OR m.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR m.price <= :maxPrice) " +
            "GROUP BY m.id, c.name, p.code")
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
