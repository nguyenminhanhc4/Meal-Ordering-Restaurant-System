package org.example.backend.repository.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.example.backend.entity.notification.Notification;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserId(Long userId, Pageable pageable);

    long countByUserIdAndIsReadFalse(Long userId);
    // 🔹 Lấy danh sách notification theo ids
    List<Notification> findByIdIn(List<Long> ids);

    // 🔹 Xóa nhiều notification theo ids
    void deleteAllByIdIn(List<Long> ids);
}
