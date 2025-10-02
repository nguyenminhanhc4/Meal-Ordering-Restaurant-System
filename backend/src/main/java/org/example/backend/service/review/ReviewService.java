package org.example.backend.service.review;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.review.ReviewDto;
import org.example.backend.entity.menu.MenuItem;
import org.example.backend.entity.review.Review;
import org.example.backend.entity.user.User;
import org.example.backend.repository.menu.MenuItemRepository;
import org.example.backend.repository.review.ReviewRepository;
import org.example.backend.repository.user.UserRepository;
import org.springframework.stereotype.Service;

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

    public ReviewDto save(ReviewDto dto) {
        Review entity = toEntity(dto);
        return new ReviewDto(reviewRepository.save(entity));
    }

    public ReviewDto getById(Long id) {
        return reviewRepository.findById(id)
                .map(ReviewDto::new)
                .orElseThrow(() -> new RuntimeException("Review not found"));
    }

    public ReviewDto updateById(Long id, ReviewDto dto) {
        Review entity = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        entity.setRating(dto.getRating());
        entity.setComment(dto.getComment());
        entity.setUpdatedAt(LocalDateTime.now());
        return new ReviewDto(reviewRepository.save(entity));
    }

    public void deleteById(Long id) {
        Review entity = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        reviewRepository.delete(entity);
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
