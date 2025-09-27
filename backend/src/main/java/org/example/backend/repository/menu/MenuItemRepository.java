package org.example.backend.repository.menu;

import org.example.backend.dto.menu.MenuItemDetailDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.example.backend.entity.menu.MenuItem;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
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
            "GROUP BY m.id, c.name, p.code")
    List<Object[]> findAllWithDetails();

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
            "WHERE m.id = :id " +
            "GROUP BY m.id, c.name, p.code")
    Optional<MenuItemDetailDto> findByIdWithDetails(@Param("id") Long id);

}
