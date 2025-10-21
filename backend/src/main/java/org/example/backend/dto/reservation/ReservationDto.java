package org.example.backend.dto.reservation;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.backend.entity.reservation.Reservation;
import org.example.backend.entity.table.TableEntity;
import org.example.backend.entity.user.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
public class ReservationDto {
    private Long id;
    private String publicId;
    // user info
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;

    // table info
    private List<Long> tableIds;
    private List<String> tableNames;

    private LocalDateTime reservationTime;
    private Long statusId;
    private String statusName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String note;
    private Integer numberOfPeople;

    public ReservationDto(Reservation reservation) {
        if (reservation != null) {
            this.id = reservation.getId();
            this.publicId = reservation.getPublicId();
            // user
            User user = reservation.getUser(); // dùng relation ManyToOne
            if (user != null) {
                this.userId = user.getId();
                this.userName = user.getName();
                this.userEmail = user.getEmail();
                this.userPhone = user.getPhone();
            }

            this.reservationTime = reservation.getReservationTime();
            this.statusId = reservation.getStatus().getId();
            this.statusName = reservation.getStatus().getCode();
            this.createdAt = reservation.getCreatedAt();
            this.updatedAt = reservation.getUpdatedAt();
            this.note = reservation.getNote();
            this.numberOfPeople = reservation.getNumberOfPeople();

            // tables
            Set<TableEntity> tables = reservation.getTables();
            if (tables != null && !tables.isEmpty()) {
                this.tableIds = tables.stream().map(TableEntity::getId).toList();
                this.tableNames = tables.stream().map(TableEntity::getName).toList();
            }
        }
    }
}
