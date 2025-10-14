package org.example.backend.dto.review;

import lombok.*;
import org.example.backend.entity.review.Review;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDto {

    private Long id;
    private Long menuItemId;
    private String userName;
    private String userAvatar;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReviewDto(Review entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.menuItemId = entity.getMenuItem().getId();
            this.userName = entity.getUser().getName();
            this.userAvatar = entity.getUser().getAvatarUrl();
            this.rating = entity.getRating();
            this.comment = entity.getComment();
            this.createdAt = entity.getCreatedAt();
            this.updatedAt = entity.getUpdatedAt();
        }
    }
}
