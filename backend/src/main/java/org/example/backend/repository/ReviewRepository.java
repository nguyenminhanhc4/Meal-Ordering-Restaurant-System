package org.example.backend.repository;

import org.example.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMenuItemId(Long menuItemId);
    Optional<Review> findByUserIdAndMenuItemId(Long userId, Long menuItemId);
}
