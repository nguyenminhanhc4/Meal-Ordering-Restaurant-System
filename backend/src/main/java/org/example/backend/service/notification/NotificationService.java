package org.example.backend.service.notification;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.notification.NotificationDto;
import org.example.backend.entity.notification.Notification;
import org.example.backend.entity.order.Order;
import org.example.backend.entity.param.Param;
import org.example.backend.entity.reservation.Reservation;
import org.example.backend.entity.user.User;
import org.example.backend.repository.notification.NotificationRepository;
import org.example.backend.repository.param.ParamRepository;
import org.example.backend.repository.user.UserRepository;
import org.example.backend.util.WebSocketNotifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ParamRepository paramRepository;
    private final UserRepository userRepository;
    private final WebSocketNotifier webSocketNotifier;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * 🔔 Gửi thông báo đến ADMIN/STAFF khi có đơn hàng mới
     */
    public NotificationDto notifyNewOrder(Order order) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "ORDER_NEW")
                .orElseThrow(() -> new RuntimeException("Missing notification type ORDER_NEW"));

        String message = String.format("Khách hàng %s vừa tạo đơn hàng #%s, chờ xác nhận.",
                order.getUser().getName(), order.getPublicId());

        List<Notification> notifications = sendToAdmins(message, type, order, null);
        NotificationDto dto = NotificationDto.fromEntity(notifications.get(0));

        // 🔄 Gửi realtime cho admin/staff
        webSocketNotifier.notifyAdminNotification(dto);
        return dto;
    }

    /**
     * ✅ Đơn hàng được duyệt
     */
    public NotificationDto notifyOrderApproved(Order order) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "ORDER_APPROVED")
                .orElseThrow(() -> new RuntimeException("Missing notification type ORDER_APPROVED"));
        String shortId = shorten(order.getPublicId());
        String message = String.format("Đơn hàng #%s của bạn đã được duyệt!", shortId);
        return sendAndNotifyUser(order.getUser(), message, type, order, null);
    }

    public NotificationDto notifyOrderDelivered(Order order) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "ORDER_DELIVERED")
                .orElseThrow(() -> new RuntimeException("Missing notification type ORDER_DELIVERED"));
        String shortId = shorten(order.getPublicId());
        String message = String.format("Đơn hàng #%s của bạn đã được giao thành công!", shortId);
        return sendAndNotifyUser(order.getUser(), message, type, order, null);
    }

    public NotificationDto notifyOrderDelivering(Order order) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "ORDER_DELIVERING")
                .orElseThrow(() -> new RuntimeException("Missing notification type ORDER_DELIVERING"));
        String shortId = shorten(order.getPublicId());
        String message = String.format("Đơn hàng #%s của bạn đang được giao!", shortId);
        return sendAndNotifyUser(order.getUser(), message, type, order, null);
    }

    public NotificationDto notifyOrderCancelled(Order order) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "ORDER_CANCELLED")
                .orElseThrow(() -> new RuntimeException("Missing notification type ORDER_CANCELLED"));
        String shortId = shorten(order.getPublicId());
        String message = String.format("Đơn hàng #%s của bạn đã bị hủy.", shortId);
        return sendAndNotifyUser(order.getUser(), message, type, order, null);
    }

    /**
     * 🔔 Khi có đặt bàn mới
     */
    public NotificationDto notifyNewReservation(Reservation reservation) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "RESERVATION_NEW")
                .orElseThrow(() -> new RuntimeException("Missing notification type RESERVATION_NEW"));

        String tableNames = reservation.getTables().stream()
                .map(t -> t.getName())
                .collect(Collectors.joining(", "));

        String message = String.format("Khách hàng %s vừa đặt bàn [%s], chờ xác nhận.",
                reservation.getUser().getName(), tableNames);

        List<Notification> notifications = sendToAdmins(message, type, null, reservation);
        NotificationDto dto = NotificationDto.fromEntity(notifications.get(0));
        webSocketNotifier.notifyAdminNotification(dto);
        return dto;
    }

    public NotificationDto notifyReservationApproved(Reservation reservation) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "RESERVATION_CONFIRMED")
                .orElseThrow(() -> new RuntimeException("Missing notification type RESERVATION_CONFIRMED"));

        String tableNames = reservation.getTables().stream().map(t -> t.getName()).collect(Collectors.joining(", "));
        String formattedTime = reservation.getReservationTime().format(formatter);
        String message = String.format("Đơn đặt bàn [%s] của bạn lúc %s đã được xác nhận. Vui lòng đến đúng giờ!", tableNames, formattedTime);
        return sendAndNotifyUser(reservation.getUser(), message, type, null, reservation);
    }

    public NotificationDto notifyReservationCompleted(Reservation reservation) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "RESERVATION_COMPLETED")
                .orElseThrow(() -> new RuntimeException("Missing notification type RESERVATION_COMPLETED"));

        String tableNames = reservation.getTables().stream().map(t -> t.getName()).collect(Collectors.joining(", "));
        String message = String.format("Cảm ơn bạn đã sử dụng bàn [%s]! Hãy đánh giá trải nghiệm của bạn nhé!", tableNames);
        return sendAndNotifyUser(reservation.getUser(), message, type, null, reservation);
    }

    public NotificationDto notifyReservationCancelled(Reservation reservation) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "RESERVATION_CANCELLED")
                .orElseThrow(() -> new RuntimeException("Missing notification type RESERVATION_CANCELLED"));

        String tableNames = reservation.getTables().stream().map(t -> t.getName()).collect(Collectors.joining(", "));
        String message = String.format("Đơn đặt bàn [%s] của bạn đã bị hủy.", tableNames);
        return sendAndNotifyUser(reservation.getUser(), message, type, null, reservation);
    }

    // ========================== Helper Methods ==========================

    private NotificationDto sendAndNotifyUser(User user, String message, Param type, Order order, Reservation reservation) {
        Notification notification = saveNotification(user, message, type, order, reservation);
        NotificationDto dto = NotificationDto.fromEntity(notification);
        webSocketNotifier.notifyNewNotification(user.getPublicId(), dto);
        return dto;
    }

    private List<Notification> sendToAdmins(String message, Param type, Order order, Reservation reservation) {
        List<User> admins = new ArrayList<>();
        admins.addAll(userRepository.findByRoleCode("ADMIN"));
        admins.addAll(userRepository.findByRoleCode("STAFF"));

        List<Notification> list = new ArrayList<>();
        for (User admin : admins) {
            Notification noti = saveNotification(admin, message, type, order, reservation);
            webSocketNotifier.notifyNewNotification(admin.getPublicId(), NotificationDto.fromEntity(noti));
            list.add(noti);
        }
        return list;
    }

    private Notification saveNotification(User user, String message, Param type, Order order, Reservation reservation) {
        Notification noti = new Notification();
        noti.setUser(user);
        noti.setOrder(order);
        noti.setReservation(reservation);
        noti.setMessage(message);
        noti.setType(type);
        noti.setIsRead(false);
        return notificationRepository.save(noti);
    }

    private String shorten(String publicId) {
        return publicId != null && publicId.length() > 8 ? publicId.substring(0, 8) : publicId;
    }
}
