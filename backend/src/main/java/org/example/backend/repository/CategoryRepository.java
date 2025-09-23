package org.example.backend.repository;

import org.example.backend.entity.Categories;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Categories, Long> {
    List<Categories> findByParentId(Long parentId);

    Optional<Categories> findByName(String name);
}
