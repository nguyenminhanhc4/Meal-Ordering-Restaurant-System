package org.example.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.backend.entity.Reservation;
import org.example.backend.util.DataUtil;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ReservationDto {
    private Long id;
    private String publicId;
    private Long userId;
    private Long tableId;
    private LocalDateTime reservationTime;
    private Long statusId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Extra formatted fields for client display
    private String reservationTimeFormatted;
    private String createdAtFormatted;
    private String updatedAtFormatted;

    public ReservationDto(Reservation reservation) {
        if (reservation != null) {
            this.id = reservation.getId();
            this.publicId = reservation.getPublicId();
            this.userId = reservation.getUserId();
            this.tableId = reservation.getTableId();
            this.reservationTime = reservation.getReservationTime();
            this.statusId = reservation.getStatusId();
            this.createdAt = reservation.getCreatedAt();
            this.updatedAt = reservation.getUpdatedAt();

            // Use DataUtil for human-readable fields
            this.reservationTimeFormatted = DataUtil.formatDate(reservationTime, DataUtil.DEFAULT_DATE_TIME_PATTERN);
            this.createdAtFormatted = DataUtil.formatDate(createdAt, DataUtil.DEFAULT_DATE_TIME_PATTERN);
            this.updatedAtFormatted = DataUtil.formatDate(updatedAt, DataUtil.DEFAULT_DATE_TIME_PATTERN);
        }
    }
}
