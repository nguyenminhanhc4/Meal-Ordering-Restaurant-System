package org.example.backend.service;

import org.example.backend.dto.ReservationDto;
import org.example.backend.dto.TableDto;
import org.example.backend.entity.Reservation;
import org.example.backend.entity.TableEntity;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.ParamRepository;
import org.example.backend.repository.ReservationRepository;
import org.example.backend.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReservationService3 {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private ParamRepository paramRepository;

    // CUSTOMER creates reservation for themselves
    public ReservationDto createMyReservation(Long userId, ReservationDto dto) {
        Reservation reservation = new Reservation();
        reservation.setPublicId(UUID.randomUUID().toString());
        reservation.setUserId(userId);
        reservation.setTableId(dto.getTableId());

        // reservation time: use provided or default to now
        if (dto.getReservationTime() != null) {
            reservation.setReservationTime(dto.getReservationTime());
        } else {
            reservation.setReservationTime(LocalDateTime.now());
        }

        // Default status = CONFIRMED
        Long statusId = paramRepository.findByTypeAndCode("RESERVATION_STATUS", "CONFIRMED")
                .orElseThrow(() -> new ResourceNotFoundException("Status CONFIRMED not found"))
                .getId();
        reservation.setStatusId(statusId);

        // timestamps
        reservation.setCreatedAt(LocalDateTime.now());
        reservation.setUpdatedAt(LocalDateTime.now());

        Reservation saved = reservationRepository.save(reservation);

        // mark table OCCUPIED if chosen
        if (saved.getTableId() != null) {
            TableEntity table = tableRepository.findById(saved.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + saved.getTableId()));

            Long occupiedStatusId = paramRepository.findByTypeAndCode("TABLE_STATUS", "OCCUPIED")
                    .orElseThrow(() -> new ResourceNotFoundException("Table status OCCUPIED not found"))
                    .getId();
            table.setStatusId(occupiedStatusId);
            tableRepository.save(table);
        }

        return new ReservationDto(saved);
    }

    public List<ReservationDto> getMyReservations(Long userId) {
        return reservationRepository.findAll().stream()
                .filter(r -> r.getUserId().equals(userId))
                .map(ReservationDto::new)
                .collect(Collectors.toList());
    }

    public ReservationDto getReservationByPublicId(String publicId) {
        Reservation reservation = reservationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with publicId: " + publicId));
        return new ReservationDto(reservation);
    }

    public ReservationDto updateMyReservation(String publicId, ReservationDto dto) {
        Reservation reservation = reservationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with publicId: " + publicId));

        if (dto.getReservationTime() != null) {
            reservation.setReservationTime(dto.getReservationTime());
        }
        if (dto.getStatusId() != null) {
            reservation.setStatusId(dto.getStatusId());
        }
        if (dto.getTableId() != null) {
            reservation.setTableId(dto.getTableId());
        }

        reservation.setUpdatedAt(LocalDateTime.now());

        Reservation saved = reservationRepository.save(reservation);
        return new ReservationDto(saved);
    }

    public void deleteMyReservation(String publicId) {
        Reservation reservation = reservationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with publicId: " + publicId));

        // release table if assigned
        if (reservation.getTableId() != null) {
            TableEntity table = tableRepository.findById(reservation.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + reservation.getTableId()));
            Long availableStatusId = paramRepository.findByTypeAndCode("TABLE_STATUS", "AVAILABLE")
                    .orElseThrow(() -> new ResourceNotFoundException("Table status AVAILABLE not found"))
                    .getId();
            table.setStatusId(availableStatusId);
            tableRepository.save(table);
        }

        reservationRepository.delete(reservation);
    }

    public List<ReservationDto> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(ReservationDto::new)
                .collect(Collectors.toList());
    }

    public ReservationDto updateReservation(Long id, ReservationDto dto) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        if (dto.getReservationTime() != null) {
            reservation.setReservationTime(dto.getReservationTime());
        }
        if (dto.getStatusId() != null) {
            reservation.setStatusId(dto.getStatusId());
        }
        if (dto.getTableId() != null) {
            reservation.setTableId(dto.getTableId());
        }

        reservation.setUpdatedAt(LocalDateTime.now());

        Reservation saved = reservationRepository.save(reservation);
        return new ReservationDto(saved);
    }

    public void deleteReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        if (reservation.getTableId() != null) {
            TableEntity table = tableRepository.findById(reservation.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + reservation.getTableId()));
            Long availableStatusId = paramRepository.findByTypeAndCode("TABLE_STATUS", "AVAILABLE")
                    .orElseThrow(() -> new ResourceNotFoundException("Table status AVAILABLE not found"))
                    .getId();
            table.setStatusId(availableStatusId);
            tableRepository.save(table);
        }

        reservationRepository.delete(reservation);
    }

    public List<TableDto> getAvailableTables() {
        Long availableStatusId = paramRepository.findByTypeAndCode("TABLE_STATUS", "AVAILABLE")
                .orElseThrow(() -> new ResourceNotFoundException("Table status AVAILABLE not found"))
                .getId();

        return tableRepository.findByStatusId(availableStatusId).stream()
                .map(TableDto::new)
                .collect(Collectors.toList());
    }
}
