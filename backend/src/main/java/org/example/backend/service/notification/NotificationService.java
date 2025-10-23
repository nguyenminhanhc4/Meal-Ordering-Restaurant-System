package org.example.backend.service.notification;

import lombok.RequiredArgsConstructor;
import org.example.backend.entity.notification.Notification;
import org.example.backend.entity.order.Order;
import org.example.backend.entity.reservation.Reservation;
import org.example.backend.entity.user.User;
import org.example.backend.repository.notification.NotificationRepository;
import org.example.backend.repository.param.ParamRepository;
import org.example.backend.repository.user.UserRepository;
import org.example.backend.entity.param.Param;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ParamRepository paramRepository;
    private final UserRepository userRepository;

    /**
     * Gửi thông báo đến ADMIN/STAFF khi có đơn hàng mới
     */
    public void notifyNewOrder(Order order) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "ORDER_NEW")
                .orElseThrow(() -> new RuntimeException("Missing notification type ORDER_CREATED"));

        String message = String.format("Khách hàng %s vừa tạo đơn hàng #%d, chờ xác nhận.",
                order.getUser().getName(), order.getId());

        sendToAdmins(message, type, order, null);
    }

    /**
     * Gửi thông báo đến USER khi đơn được duyệt
     */
    public void notifyOrderApproved(Order order) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "ORDER_APPROVED")
                .orElseThrow(() -> new RuntimeException("Missing notification type ORDER_APPROVED"));

        String message = String.format("Đơn hàng #%d của bạn đã được duyệt!", order.getId());
        sendToUser(order.getUser(), message, type, order, null);
    }

    public void notifyOrderDelivered(Order order) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "ORDER_DELIVERED")
                .orElseThrow(() -> new RuntimeException("Missing notification type ORDER_DELIVERED"));

        String message = String.format("Đơn hàng #%d của bạn đã được giao!", order.getId());
        sendToUser(order.getUser(), message, type, order, null);
    }

    public void notifyOrderDelivering(Order order) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "ORDER_DELIVERING")
                .orElseThrow(() -> new RuntimeException("Missing notification type ORDER_DELIVERING"));

        String message = String.format("Đơn hàng #%d của bạn đang được giao!", order.getId());
        sendToUser(order.getUser(), message, type, order, null);
    }

    /**
     * Gửi thông báo đến USER khi đơn bị hủy
     */
    public void notifyOrderCancelled(Order order) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "ORDER_CANCELLED")
                .orElseThrow(() -> new RuntimeException("Missing notification type ORDER_CANCELLED"));

        String message = String.format("Đơn hàng #%d của bạn đã bị hủy.", order.getId());
        sendToUser(order.getUser(), message, type, order, null);
    }

    /**
     * Gửi thông báo khi có đặt bàn mới
     */
    public void notifyNewReservation(Reservation reservation) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "RESERVATION_CREATED")
                .orElseThrow(() -> new RuntimeException("Missing notification type RESERVATION_CREATED"));

        String message = String.format("Khách hàng %s vừa đặt bàn #%d, chờ xác nhận.",
                reservation.getUser().getName(), reservation.getId());

        sendToAdmins(message, type, null, reservation);
    }

    // --- Helper methods ---
    private void sendToAdmins(String message, Param type, Order order, Reservation reservation) {
        List<User> admins = new ArrayList<>();
        admins.addAll(userRepository.findByRoleCode("ADMIN"));
        admins.addAll(userRepository.findByRoleCode("STAFF"));
        for (User admin : admins) {
            saveNotification(admin, message, type, order, reservation);
        }
    }

    private void sendToUser(User user, String message, Param type, Order order, Reservation reservation) {
        saveNotification(user, message, type, order, reservation);
    }

    private void saveNotification(User user, String message, Param type, Order order, Reservation reservation) {
        Notification noti = new Notification();
        noti.setUser(user);
        noti.setOrder(order);
        noti.setReservation(reservation);
        noti.setMessage(message);
        noti.setType(type);
        noti.setIsRead(false);
        notificationRepository.save(noti);
    }
}
