package org.example.backend.repository.menu;

import org.example.backend.entity.menu.Combo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ComboRepository extends JpaRepository<Combo, Long> {
    @Query("""
        SELECT c,
               cat.name AS categoryName,
               st.name AS statusName
        FROM Combo c
        LEFT JOIN c.category cat
        LEFT JOIN c.status st
        """)
    Page<Object[]> findAllWithDetails(Pageable pageable);

    @Query("""
        SELECT c,
               cat.name AS categoryName,
               st.name AS statusName
        FROM Combo c
        LEFT JOIN c.category cat
        LEFT JOIN c.status st
        WHERE (:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<Object[]> findAllWithSearch(@Param("search") String search, Pageable pageable);
}
