package org.example.backend.repository.review;

import org.example.backend.entity.review.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMenuItemId(Long menuItemId);
    Optional<Review> findByUserIdAndMenuItemId(Long userId, Long menuItemId);
    boolean existsByUserIdAndMenuItemId(Long userId, Long menuItemId);
    Page<Review> findByMenuItemId(Long menuItemId, Pageable pageable);
    Page<Review> findByMenuItemIdAndRatingGreaterThanEqual(Long menuItemId, int rating, Pageable pageable);
    Page<Review> findByMenuItemIdAndRatingLessThanEqual(Long menuItemId, int rating, Pageable pageable);
    Page<Review> findByMenuItemIdAndRating(Long menuItemId, int rating, Pageable pageable);

}
