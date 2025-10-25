package org.example.backend.controller.notification;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.notification.NotificationDto;
import org.example.backend.entity.user.User;
import org.example.backend.repository.notification.NotificationRepository;
import org.example.backend.repository.user.UserRepository;
import org.example.backend.service.notification.NotificationService;
import org.example.backend.util.JwtUtil;
import org.example.backend.util.WebSocketNotifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
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
    public ResponseEntity<Page<NotificationDto>> getMyNotifications(
            @CookieValue("token") String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String publicId = jwtUtil.getPublicIdFromToken(token);
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(
                Sort.Order.asc("isRead"),
                Sort.Order.desc("createdAt")
        ));

        Page<NotificationDto> notifications = notificationRepository
                .findByUserId(user.getId(), pageable)
                .map(NotificationDto::fromEntity);

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

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @CookieValue("token") String token) {

        String publicId = jwtUtil.getPublicIdFromToken(token);
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long count = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteNotifications(
            @CookieValue("token") String token,
            @RequestBody List<Long> ids) {

        String publicId = jwtUtil.getPublicIdFromToken(token);
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Lấy danh sách notification của user để check quyền
        List<Long> userNotificationIds = notificationRepository
                .findByIdIn(ids).stream()
                .filter(n -> n.getUser().getId().equals(user.getId()))
                .map(n -> n.getId())
                .collect(Collectors.toList());

        if (userNotificationIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Xóa các notification hợp lệ
        notificationRepository.deleteAllById(userNotificationIds);

        // 🔔 Gửi WS tận dụng cả 2 loại
        if (userNotificationIds.size() == 1) {
            webSocketNotifier.notifyNotificationDeleted(user.getPublicId(), userNotificationIds.get(0));
        } else {
            webSocketNotifier.notifyNotificationDeleted(user.getPublicId(), userNotificationIds);
        }

        return ResponseEntity.noContent().build();
    }

}
