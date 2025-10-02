package org.example.backend.entity.notification;

import jakarta.persistence.*;
import lombok.*;
import org.example.backend.entity.BaseEntity;
import org.example.backend.entity.order.Order;
import org.example.backend.entity.param.Param;
import org.example.backend.entity.reservation.Reservation;
import org.example.backend.entity.user.User;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @ManyToOne
    @JoinColumn(name = "type_id")
    private Param type;

    @Column(nullable = false)
    private Boolean isRead = false;
}
