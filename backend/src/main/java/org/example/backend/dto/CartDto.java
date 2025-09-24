package org.example.backend.dto;

import lombok.*;
import org.example.backend.entity.Cart;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDto {

    private Long id;
    private Long userId;
    private String userName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CartDto(Cart entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.userId = entity.getUser().getId();
            this.userName = entity.getUser().getName();
            this.status = entity.getStatus() != null ? entity.getStatus().getCode() : null;
            this.createdAt = entity.getCreatedAt();
            this.updatedAt = entity.getUpdatedAt();
        }
    }
}
