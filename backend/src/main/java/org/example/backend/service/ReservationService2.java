package org.example.backend.service;

import org.example.backend.dto.ReservationDto;
import org.example.backend.entity.Reservation;
import org.example.backend.entity.TableEntity;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.ParamRepository;
import org.example.backend.repository.ReservationRepository;
import org.example.backend.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ReservationService2 {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private ParamRepository paramRepository;

    public ReservationDto createReservation(ReservationDto dto) {
        Reservation reservation = new Reservation();

        reservation.setPublicId(UUID.randomUUID().toString());
        reservation.setUserId(dto.getUserId());
        reservation.setTableId(dto.getTableId());

        // Set reservation time (now if not provided)
        if (dto.getReservationTime() != null) {
            reservation.setReservationTime(dto.getReservationTime());
        } else {
            reservation.setReservationTime(LocalDateTime.now());
        }

        // Default status = CONFIRMED (or PENDING, depending on your system)
        Long statusId = paramRepository.findByTypeAndCode("RESERVATION_STATUS", "CONFIRMED")
                .orElseThrow(() -> new ResourceNotFoundException("Status CONFIRMED not found"))
                .getId();
        reservation.setStatusId(statusId);

        // Explicitly set createdAt and updatedAt (since DB isn’t handling it)
        reservation.setCreatedAt(LocalDateTime.now());
        reservation.setUpdatedAt(LocalDateTime.now());

        // Save
        Reservation saved = reservationRepository.save(reservation);

        // Mark table as OCCUPIED
        TableEntity table = tableRepository.findById(saved.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + saved.getTableId()));
        Long occupiedStatusId = paramRepository.findByTypeAndCode("TABLE_STATUS", "OCCUPIED")
                .orElseThrow(() -> new ResourceNotFoundException("Table status OCCUPIED not found"))
                .getId();
        table.setStatusId(occupiedStatusId);
        tableRepository.save(table);

        return new ReservationDto(saved);
    }

    public ReservationDto updateReservation(Long id, ReservationDto dto) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        if (dto.getReservationTime() != null) {
            reservation.setReservationTime(dto.getReservationTime());
        }
        if (dto.getTableId() != null) {
            reservation.setTableId(dto.getTableId());
        }
        if (dto.getStatusId() != null) {
            reservation.setStatusId(dto.getStatusId());
        }

        // Always refresh updatedAt
        reservation.setUpdatedAt(LocalDateTime.now());

        Reservation saved = reservationRepository.save(reservation);
        return new ReservationDto(saved);
    }
}
