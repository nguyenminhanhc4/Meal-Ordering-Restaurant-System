package org.example.backend.util;

import lombok.RequiredArgsConstructor;
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
        notify("/topic/order/" + publicId, Map.of(
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

}
