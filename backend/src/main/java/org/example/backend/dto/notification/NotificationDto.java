package org.example.backend.dto.notification;

import lombok.*;
import org.example.backend.entity.notification.Notification;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {

    private Long id;
    private Long userId;
    private Long orderId;
    private Long reservationId;
    private String message;
    private String type;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public NotificationDto(Notification notification) {
        this.id = notification.getId();
        this.userId = notification.getUser().getId();
        this.orderId = notification.getOrder() != null ? notification.getOrder().getId() : null;
        this.reservationId = notification.getReservation() != null ? notification.getReservation().getId() : null;
        this.message = notification.getMessage();
        this.type = notification.getType() != null ? notification.getType().getCode() : null;
        this.isRead = notification.getIsRead();
        this.createdAt = notification.getCreatedAt();
    }
}
