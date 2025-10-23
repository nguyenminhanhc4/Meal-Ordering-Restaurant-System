package org.example.backend.dto.notification;

import lombok.Data;
import org.example.backend.entity.notification.Notification;

import java.time.LocalDateTime;

@Data
public class NotificationDto {
    private Long id;
    private String message;
    private Boolean isRead;
    private String typeName;
    private LocalDateTime createdAt;

    public static NotificationDto fromEntity(Notification noti) {
        NotificationDto dto = new NotificationDto();
        dto.setId(noti.getId());
        dto.setMessage(noti.getMessage());
        dto.setIsRead(noti.getIsRead());
        dto.setTypeName(noti.getType() != null ? noti.getType().getName() : null);
        dto.setCreatedAt(noti.getCreatedAt());
        return dto;
    }
}
