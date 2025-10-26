package org.example.backend.repository.menu;

import org.example.backend.entity.menu.Combo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface ComboRepository extends JpaRepository<Combo, Long> {

    // ============================================
    // 🟢 Base Query: fetch all combos (paged)
    // ============================================
    @Query("""
        SELECT c
        FROM Combo c
        LEFT JOIN c.typeCategory tc
        LEFT JOIN c.peopleCategory pc
        LEFT JOIN c.availabilityCategories ac
        LEFT JOIN c.status s
    """)
    Page<Combo> findAllWithDetails(Pageable pageable);

    // ============================================
    // 🔍 Search by name (paged)
    // ============================================
    @Query("""
        SELECT c
        FROM Combo c
        LEFT JOIN c.typeCategory tc
        LEFT JOIN c.peopleCategory pc
        LEFT JOIN c.availabilityCategories ac
        LEFT JOIN c.status s
        WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))
    """)
    Page<Combo> findAllWithDetailsByName(@Param("name") String name, Pageable pageable);

    // ============================================
    // 🔍 Filter by type category (paged)
    // ============================================
    @Query("""
        SELECT c
        FROM Combo c
        LEFT JOIN c.typeCategory tc
        LEFT JOIN c.peopleCategory pc
        LEFT JOIN c.availabilityCategories ac
        LEFT JOIN c.status s
        WHERE tc.id = :typeCategoryId
    """)
    Page<Combo> findByTypeCategory(@Param("typeCategoryId") Long typeCategoryId, Pageable pageable);

    // ============================================
    // 🔍 Filter by type category + search (paged)
    // ============================================
    @Query("""
        SELECT c
        FROM Combo c
        LEFT JOIN c.typeCategory tc
        LEFT JOIN c.peopleCategory pc
        LEFT JOIN c.availabilityCategories ac
        LEFT JOIN c.status s
        WHERE tc.id = :typeCategoryId
          AND LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))
    """)
    Page<Combo> findByTypeCategoryAndName(
            @Param("typeCategoryId") Long typeCategoryId,
            @Param("name") String name,
            Pageable pageable);

    // ============================================
    // 🏆 Popular combos (sorted by “popularity”)
    // ============================================
    @Query("""
        SELECT c
        FROM Combo c
        LEFT JOIN c.typeCategory tc
        LEFT JOIN c.peopleCategory pc
        LEFT JOIN c.availabilityCategories ac
        LEFT JOIN c.status s
        WHERE c.createdAt > :newThreshold OR c.discountPercent > 0
        ORDER BY c.discountPercent DESC, c.createdAt DESC
    """)
    Page<Combo> findAllWithDetailsOrdered(
            @Param("newThreshold") LocalDateTime newThreshold,
            Pageable pageable);

    // ============================================
    // 🏅 Top popular (limited by Pageable)
    // ============================================
    @Query("""
        SELECT c
        FROM Combo c
        LEFT JOIN c.menuItems mi
        GROUP BY c.id
        ORDER BY COUNT(mi) DESC, c.createdAt DESC
    """)
    Page<Combo> findTopPopular(Pageable pageable);
}
