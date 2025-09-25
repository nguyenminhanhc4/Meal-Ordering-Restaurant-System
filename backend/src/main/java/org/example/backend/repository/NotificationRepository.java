package org.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.example.backend.entity.Notification;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
}
