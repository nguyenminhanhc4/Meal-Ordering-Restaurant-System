package org.example.backend.repository.category;

import org.example.backend.entity.category.Categories;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Categories, Long> {
    List<Categories> findByParentId(Long parentId);

    @Query(value = """
    WITH RECURSIVE category_tree AS (
      SELECT * FROM categories WHERE id = :parentId
      UNION ALL
      SELECT c.* FROM categories c
      INNER JOIN category_tree ct ON c.parent_id = ct.id
    )
    SELECT * FROM category_tree WHERE id != :parentId
    """, nativeQuery = true)
    List<Categories> findAllDescendants(@Param("parentId") Long parentId);


    Optional<Categories> findByName(String name);
    
    // Phân trang cơ bản
    Page<Categories> findAll(Pageable pageable);
    
    // Tìm kiếm theo tên với phân trang
    Page<Categories> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    // Tìm kiếm theo mô tả với phân trang  
    Page<Categories> findByDescriptionContainingIgnoreCase(String description, Pageable pageable);
    
    // Tìm theo parent với phân trang
    Page<Categories> findByParentId(Long parentId, Pageable pageable);
    
    // Tìm root categories (parent = null) với phân trang
    Page<Categories> findByParentIsNull(Pageable pageable);
    
    // Tìm categories có parent (parent != null) với phân trang
    Page<Categories> findByParentIsNotNull(Pageable pageable);
    
    // Query phức tạp với nhiều điều kiện
    @Query("SELECT c FROM Categories c WHERE " +
           "(:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:description IS NULL OR LOWER(c.description) LIKE LOWER(CONCAT('%', :description, '%'))) AND " +
           "(:parentId IS NULL OR c.parent.id = :parentId) AND " +
           "(:hasParent IS NULL OR " +
           "  (:hasParent = true AND c.parent IS NOT NULL) OR " +
           "  (:hasParent = false AND c.parent IS NULL))")
    Page<Categories> findCategoriesWithFilters(
            @Param("name") String name,
            @Param("description") String description, 
            @Param("parentId") Long parentId,
            @Param("hasParent") Boolean hasParent,
            Pageable pageable);
}
