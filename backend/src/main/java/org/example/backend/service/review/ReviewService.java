package org.example.backend.service.review;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.review.ReviewDto;
import org.example.backend.entity.menu.MenuItem;
import org.example.backend.entity.review.Review;
import org.example.backend.entity.user.User;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.menu.MenuItemRepository;
import org.example.backend.repository.review.ReviewRepository;
import org.example.backend.repository.user.UserRepository;
import org.example.backend.service.user.UserService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;

    public List<ReviewDto> findAll() {
        return reviewRepository.findAll()
                .stream().map(ReviewDto::new)
                .collect(Collectors.toList());
    }

    public Optional<ReviewDto> findById(Long id) {
        return reviewRepository.findById(id).map(ReviewDto::new);
    }

    public ReviewDto save(ReviewDto dto, Long userId, Long menuItemId) {
        Review entity = new Review();
        entity.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found")));
        entity.setMenuItem(menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found")));
        entity.setRating(dto.getRating());
        entity.setComment(dto.getComment());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());

        return new ReviewDto(reviewRepository.save(entity));
    }


    public ReviewDto getById(Long id) {
        return reviewRepository.findById(id)
                .map(ReviewDto::new)
                .orElseThrow(() -> new RuntimeException("Review not found"));
    }

    public ReviewDto updateById(Long id, ReviewDto dto, Long currentUserId) {
        Review entity = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!entity.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("Bạn không có quyền sửa đánh giá này");
        }

        entity.setRating(dto.getRating());
        entity.setComment(dto.getComment());
        entity.setUpdatedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(entity);
        return new ReviewDto(saved);
    }

    @Transactional
    public void deleteById(Long id, Long currentUserId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        // Nếu không phải chủ sở hữu và không phải admin => cấm xóa
        if (!review.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("Bạn không có quyền sửa đánh giá này");
        }

        reviewRepository.delete(review);
    }


    public boolean existsByUserIdAndMenuId(Long userId, Long menuId) {
        return reviewRepository.existsByUserIdAndMenuItemId(userId, menuId);
    }

    private Review toEntity(ReviewDto dto) {
        Review entity = new Review();
        entity.setId(dto.getId());
        entity.setRating(dto.getRating());
        entity.setComment(dto.getComment());
        entity.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        return entity;
    }
}
