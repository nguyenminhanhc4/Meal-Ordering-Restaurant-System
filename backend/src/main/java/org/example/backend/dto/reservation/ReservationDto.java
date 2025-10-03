package org.example.backend.dto.reservation;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.backend.entity.reservation.Reservation;
import org.example.backend.entity.table.TableEntity;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ReservationDto {
    private Long id;
    private String publicId;
    private Long userId;
    private List<Long> tableIds; // 🔹 multiple tables now
    private LocalDateTime reservationTime;
    private Long statusId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String note;
    private int numberOfPeople;

    public ReservationDto(Reservation reservation) {
        if (reservation != null) {
            this.id = reservation.getId();
            this.publicId = reservation.getPublicId();
            this.userId = reservation.getUserId();
            this.reservationTime = reservation.getReservationTime();
            this.statusId = reservation.getStatusId();
            this.createdAt = reservation.getCreatedAt();
            this.updatedAt = reservation.getUpdatedAt();
            this.note = reservation.getNote();
            this.numberOfPeople = reservation.getNumberOfPeople();

            // map tables -> ids
            this.tableIds = reservation.getTables()
                    .stream()
                    .map(TableEntity::getId)
                    .toList();
        }
    }
}
