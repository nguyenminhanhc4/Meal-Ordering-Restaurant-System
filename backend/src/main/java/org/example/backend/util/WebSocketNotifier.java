package org.example.backend.util;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.notification.NotificationDto;
import org.example.backend.dto.order.OrderResponseDTO;
import org.example.backend.entity.order.Order;
import org.example.backend.entity.param.Param;
import org.example.backend.repository.param.ParamRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class WebSocketNotifier {

    private final SimpMessagingTemplate messagingTemplate;
    private final ParamRepository paramRepository;

    /**
     * Gửi thông báo cho client theo topic.
     * @param topic đường dẫn topic, ví dụ: "/topic/order/{publicId}"
     * @param payload dữ liệu gửi lên client
     */
    public void notify(String topic, Map<String, Object> payload) {
        messagingTemplate.convertAndSend(topic, payload);
    }

    /**
     * Gửi thông báo cập nhật trạng thái order
     */
    public void notifyOrderStatus(String publicId, String newStatus) {
        notify("/topic/order", Map.of(
                "orderPublicId", publicId,
                "status", newStatus
        ));
    }

    /**
     * Gửi thông báo cập nhật trạng thái payment
     */
    public void notifyPaymentStatus(String publicId, String paymentStatus) {
        notify("/topic/payment/" + publicId, Map.of(
                "orderPublicId", publicId,
                "paymentStatus", paymentStatus
        ));
    }

    /**
     * Gửi thông báo cập nhật inventory của menuItem
     */
    public void notifyMenuItemStock(Long menuItemId) {
        notify("/topic/menu/" + menuItemId, Map.of("menuItemId", menuItemId));
    }

    public void notifyNewOrderForAdmin(OrderResponseDTO order) {
        messagingTemplate.convertAndSend("/topic/admin/orders", order);
    }

    /**
     * Gửi thông báo cập nhật trạng thái bàn
     */
    public void notifyTableStatus(Long tableId, String newStatus) {
        Param status = paramRepository.findByTypeAndCode("STATUS_TABLE", newStatus)
                .orElseThrow(() -> new RuntimeException("Table status not found: " + newStatus));
        notify("/topic/tables", Map.of(
                "tableId", tableId,
                "statusId", status.getId()
        ));
    }

    public void notifyReservationStatus(String publicId, String newStatus) {
        notify("/topic/reservations", Map.of(
                "reservationPublicId", publicId,
                "status", newStatus
        ));
    }
    /**
     * Gửi thông báo khi tạo mới MenuItem
     */
    public void notifyNewMenuItem(Long menuItemId, String name, String avatarUrl, Long categoryId) {
        notify("/topic/menu/new", Map.of(
                "menuItemId", menuItemId,
                "name", name,
                "avatarUrl", avatarUrl,
                "categoryId", categoryId
        ));
    }
    /**
     * 🗑️ Gửi thông báo khi xóa MenuItem
     */
    public void notifyDeletedMenuItem(Long menuItemId) {
        notify("/topic/menu/delete", Map.of(
                "menuItemId", menuItemId
        ));
    }

    /**
     * ✏️ Gửi thông báo khi cập nhật MenuItem
     */
    public void notifyUpdatedMenuItem(Long menuItemId, String name, String avatarUrl, Long categoryId) {
        notify("/topic/menu/update", Map.of(
                "menuItemId", menuItemId,
                "name", name,
                "avatarUrl", avatarUrl,
                "categoryId", categoryId
        ));
    }

    public void notifyNewCategory(Long categoryId, String name) {
        notify("/topic/category/new", Map.of(
                "categoryId", categoryId,
                "name", name
        ));
    }

    public void notifyCategoryUpdated(Long categoryId, String name) {
        notify("/topic/category/update", Map.of(
                "categoryId", categoryId,
                "name", name
        ));
    }

    public void notifyCategoryDeleted(Long categoryId) {
        notify("/topic/category/delete", Map.of(
                "categoryId", categoryId
        ));
    }

    /**
     * 🔔 Gửi thông báo mới đến user cụ thể (qua topic riêng)
     * Client sẽ subscribe /topic/notifications/{userPublicId}
     */
    public void notifyNewNotification(String userPublicId, Object notificationDto) {
        notify("/topic/notifications/" + userPublicId, Map.of(
                "type", "NEW_NOTIFICATION",
                "data", notificationDto
        ));
    }

    /**
     * 🔔 Gửi thông báo realtime cho ADMIN/STAF (ví dụ có đơn hàng hoặc đặt bàn mới)
     * Client ADMIN sẽ subscribe /topic/notifications/admin
     */
    public void notifyAdminNotification(Object notificationDto) {
        notify("/topic/notifications/admin", Map.of(
                "type", "NEW_NOTIFICATION",
                "data", notificationDto
        ));
    }

    public void notifyNotificationRead(String userPublicId, NotificationDto dto) {
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + userPublicId,
                Map.of(
                        "type", "NOTIFICATION_READ",
                        "data", dto
                )
        );
    }
}
