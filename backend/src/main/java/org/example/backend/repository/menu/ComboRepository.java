package org.example.backend.repository.menu;

import org.example.backend.entity.menu.Combo;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ComboRepository extends JpaRepository<Combo, Long> {

    @Query("SELECT c, " +
            "cat.name AS categoryName, " +
            "LOWER(REPLACE(cat.name, ' ', '-')) AS categorySlug, " +
            "p.code AS status, " +
            "COALESCE(SUM(oi.quantity), 0) AS sold " +
            "FROM Combo c " +
            "LEFT JOIN c.category cat " +
            "LEFT JOIN c.status p " +
            "LEFT JOIN OrderItem oi ON c.id = oi.combo.id " +
            "LEFT JOIN oi.order o ON o.status.code = 'DELIVERED' " +
            "GROUP BY c.id, cat.name, p.code")
    List<Object[]> findAllWithDetails();

    @Query("SELECT c, " +
            "cat.name AS categoryName, " +
            "LOWER(REPLACE(cat.name, ' ', '-')) AS categorySlug, " +
            "p.code AS status, " +
            "COALESCE(SUM(oi.quantity), 0) AS sold " +
            "FROM Combo c " +
            "LEFT JOIN c.category cat " +
            "LEFT JOIN c.status p " +
            "LEFT JOIN OrderItem oi ON c.id = oi.combo.id " +
            "LEFT JOIN oi.order o ON o.status.code = 'DELIVERED' " +
            "GROUP BY c.id, cat.name, p.code " +
            "ORDER BY COALESCE(SUM(oi.quantity), 0) DESC")
    List<Object[]> findTopPopular(Pageable pageable);
}
