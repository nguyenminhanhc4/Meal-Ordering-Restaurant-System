package org.example.backend.repository.menu;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.example.backend.entity.menu.MenuItem;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
