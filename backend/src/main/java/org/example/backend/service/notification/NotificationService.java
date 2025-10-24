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
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    /**
     * Gửi thông báo đến ADMIN/STAFF khi có đơn hàng mới
     */
    public void notifyNewOrder(Order order) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "ORDER_NEW")
                .orElseThrow(() -> new RuntimeException("Missing notification type ORDER_CREATED"));

        String message = String.format("Khách hàng %s vừa tạo đơn hàng #%s, chờ xác nhận.",
                order.getUser().getName(), order.getPublicId());

        sendToAdmins(message, type, order, null);
    }

    /**
     * Gửi thông báo đến USER khi đơn được duyệt
     */
    public void notifyOrderApproved(Order order) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "ORDER_APPROVED")
                .orElseThrow(() -> new RuntimeException("Missing notification type ORDER_APPROVED"));
        String publicId = order.getPublicId();
        String shortId = publicId.length() > 8 ? publicId.substring(0, 8) : publicId;
        String message = String.format("Đơn hàng #%s của bạn đã được duyệt!", shortId);
        sendToUser(order.getUser(), message, type, order, null);
    }

    public void notifyOrderDelivered(Order order) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "ORDER_DELIVERED")
                .orElseThrow(() -> new RuntimeException("Missing notification type ORDER_DELIVERED"));
        String publicId = order.getPublicId();
        String shortId = publicId.length() > 8 ? publicId.substring(0, 8) : publicId;
        String message = String.format("Đơn hàng #%s của bạn đã được giao!", shortId);
        sendToUser(order.getUser(), message, type, order, null);
    }

    public void notifyOrderDelivering(Order order) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "ORDER_DELIVERING")
                .orElseThrow(() -> new RuntimeException("Missing notification type ORDER_DELIVERING"));
        String publicId = order.getPublicId();
        String shortId = publicId.length() > 8 ? publicId.substring(0, 8) : publicId;
        String message = String.format("Đơn hàng #%s của bạn đang được giao!", shortId);
        sendToUser(order.getUser(), message, type, order, null);
    }

    /**
     * Gửi thông báo đến USER khi đơn bị hủy
     */
    public void notifyOrderCancelled(Order order) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "ORDER_CANCELLED")
                .orElseThrow(() -> new RuntimeException("Missing notification type ORDER_CANCELLED"));

        String message = String.format("Đơn hàng #%s của bạn đã bị hủy.", order.getPublicId());
        sendToUser(order.getUser(), message, type, order, null);
    }

    /**
     * Gửi thông báo khi có đặt bàn mới
     */
    public void notifyNewReservation(Reservation reservation) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "RESERVATION_NEW")
                .orElseThrow(() -> new RuntimeException("Missing notification type RESERVATION_NEW"));

        String tableNames = reservation.getTables().stream()
                .map(t -> t.getName())       // hoặc getCode() tùy bạn lưu tên bàn ở đâu
                .collect(Collectors.joining(", "));

        String message = String.format("Khách hàng %s vừa đặt bàn #%s, chờ xác nhận.",
                reservation.getUser().getName(),tableNames);

        sendToAdmins(message, type, null, reservation);
    }

    public void notifyReservationApproved(Reservation reservation) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "RESERVATION_CONFIRMED")
                .orElseThrow(() -> new RuntimeException("Missing notification type RESERVATION_CONFIRMED"));

        String tableNames = reservation.getTables().stream()
                .map(t -> t.getName())       // hoặc getCode() tùy bạn lưu tên bàn ở đâu
                .collect(Collectors.joining(", "));
        String formattedTime = reservation.getReservationTime().format(formatter);
        String message = String.format("Đơn đặt bàn #%s của bạn vào lúc %s đã được xác nhận. Xin vui lòng đến đúng giờ!", tableNames,formattedTime);
        sendToUser(reservation.getUser(), message, type,null, reservation);
    }

    public void notifyReservationCompleted(Reservation reservation) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "RESERVATION_COMPLETED")
                .orElseThrow(() -> new RuntimeException("Missing notification type RESERVATION_COMPLETED"));

        String tableNames = reservation.getTables().stream()
                .map(t -> t.getName())       // hoặc getCode() tùy bạn lưu tên bàn ở đâu
                .collect(Collectors.joining(", "));
        String message = String.format("Cảm ơn bạn đã sử dụng bàn #%s! Chúng tôi hy vọng bạn có trải nghiệm tuyệt vời. Hãy đánh giá dịch vụ của chúng tôi nhé!", tableNames);
        sendToUser(reservation.getUser(), message, type,null, reservation);
    }

    public void notifyReservationCancelled(Reservation reservation) {
        Param type = paramRepository.findByTypeAndCode("NOTIFICATION", "RESERVATION_CANCELLED")
                .orElseThrow(() -> new RuntimeException("Missing notification type RESERVATION_CANCELLED"));
        String tableNames = reservation.getTables().stream()
                .map(t -> t.getName())       // hoặc getCode() tùy bạn lưu tên bàn ở đâu
                .collect(Collectors.joining(", "));
        String message = String.format("Đơn đặt bàn #%s của bạn đã bị hủy!", tableNames);
        sendToUser(reservation.getUser(), message, type,null, reservation);
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
