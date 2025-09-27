package org.example.backend.controller.review;

import org.example.backend.dto.Response;
import org.example.backend.dto.review.ReviewDto;
import org.example.backend.service.review.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAll() {
        List<ReviewDto> list = reviewService.findAll();
        return ResponseEntity.ok(new Response<>("success", list, "Reviews retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        ReviewDto dto = reviewService.getById(id);
        return ResponseEntity.ok(new Response<>("success", dto, "Review retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()") // allow any logged-in user to post a review
    public ResponseEntity<?> create(@RequestBody ReviewDto dto) {
        ReviewDto saved = reviewService.save(dto);
        return ResponseEntity.ok(new Response<>("success", saved, "Review created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #dto.userId == authentication.principal.id")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ReviewDto dto) {
        ReviewDto updated = reviewService.updateById(id, dto);
        return ResponseEntity.ok(new Response<>("success", updated, "Review updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @reviewSecurity.isOwner(#id, authentication.principal.id)")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        reviewService.deleteById(id);
        return ResponseEntity.ok(new Response<>("success", null, "Review deleted successfully"));
    }
}
