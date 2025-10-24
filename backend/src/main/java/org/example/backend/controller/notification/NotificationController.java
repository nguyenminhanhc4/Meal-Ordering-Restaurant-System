package org.example.backend.controller.notification;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.notification.NotificationDto;
import org.example.backend.entity.user.User;
import org.example.backend.repository.notification.NotificationRepository;
import org.example.backend.repository.user.UserRepository;
import org.example.backend.service.notification.NotificationService;
import org.example.backend.util.JwtUtil;
import org.example.backend.util.WebSocketNotifier;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final WebSocketNotifier webSocketNotifier;
    private final JwtUtil jwtUtil;

    /**
     * 🔹 Lấy danh sách thông báo của user hiện tại (qua token)
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDto>> getMyNotifications(
            @CookieValue("token") String token) {

        String publicId = jwtUtil.getPublicIdFromToken(token);
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<NotificationDto> notifications = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(notifications);
    }

    /**
     * 🔹 Đánh dấu 1 thông báo là đã đọc
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDto> markAsRead(
            @PathVariable Long id,
            @CookieValue("token") String token) {

        String publicId = jwtUtil.getPublicIdFromToken(token);
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        var notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not allowed to modify this notification");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
        NotificationDto dto = NotificationDto.fromEntity(notification);
        webSocketNotifier.notifyNotificationRead(user.getPublicId(), dto);
        return ResponseEntity.ok(dto);
    }
}
