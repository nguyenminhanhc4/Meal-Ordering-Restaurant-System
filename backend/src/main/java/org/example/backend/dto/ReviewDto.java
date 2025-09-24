package org.example.backend.dto;

import lombok.*;
import org.example.backend.entity.Review;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDto {

    private Long id;
    private Long userId;
    private String userName;
    private Long menuItemId;
    private String menuItemName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReviewDto(Review entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.userId = entity.getUser().getId();
            this.userName = entity.getUser().getName();
            this.menuItemId = entity.getMenuItem().getId();
            this.menuItemName = entity.getMenuItem().getName();
            this.rating = entity.getRating();
            this.comment = entity.getComment();
            this.createdAt = entity.getCreatedAt();
            this.updatedAt = entity.getUpdatedAt();
        }
    }
}
