package org.example.backend.service;

import org.example.backend.dto.ReservationDto;
import org.example.backend.dto.TableDto;
import org.example.backend.entity.Param;
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
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private ParamRepository paramRepository;

    public ReservationDto createMyReservation(Long userId, ReservationDto dto) {
        Reservation reservation = new Reservation();
        reservation.setPublicId(UUID.randomUUID().toString());
        reservation.setUserId(userId);
        reservation.setReservationTime(dto.getReservationTime());

        // Default status = CONFIRMED
        Param status = paramRepository.findByTypeAndCode("STATUS", "CONFIRMED")
                .orElseThrow(() -> new ResourceNotFoundException("Status CONFIRMED not found"));
        reservation.setStatusId(status.getId());

        // Validate & mark table as OCCUPIED
        if (dto.getTableId() != null) {
            TableEntity table = tableRepository.findById(dto.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + dto.getTableId()));

            reservation.setTableId(table.getId());

            Param occupiedStatus = paramRepository.findByTypeAndCode("STATUS", "OCCUPIED")
                    .orElseThrow(() -> new ResourceNotFoundException("Status OCCUPIED not found"));
            table.setStatusId(occupiedStatus.getId());
            tableRepository.save(table);
        }

        reservationRepository.save(reservation);
        return new ReservationDto(reservation);
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

        reservation.setReservationTime(dto.getReservationTime());

        if (dto.getStatusId() != null) {
            Param status = paramRepository.findById(dto.getStatusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Status not found with id: " + dto.getStatusId()));
            reservation.setStatusId(status.getId());

            // Release table if CANCELLED
            if ("CANCELLED".equalsIgnoreCase(status.getCode()) && reservation.getTableId() != null) {
                TableEntity table = tableRepository.findById(reservation.getTableId())
                        .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + reservation.getTableId()));

                Param availableStatus = paramRepository.findByTypeAndCode("STATUS", "AVAILABLE")
                        .orElseThrow(() -> new ResourceNotFoundException("Status AVAILABLE not found"));
                table.setStatusId(availableStatus.getId());
                tableRepository.save(table);
            }
        }

        reservationRepository.save(reservation);
        return new ReservationDto(reservation);
    }

    public void deleteMyReservation(String publicId) {
        Reservation reservation = reservationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with publicId: " + publicId));

        // Release table
        if (reservation.getTableId() != null) {
            TableEntity table = tableRepository.findById(reservation.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + reservation.getTableId()));
            Param availableStatus = paramRepository.findByTypeAndCode("STATUS", "AVAILABLE")
                    .orElseThrow(() -> new ResourceNotFoundException("Status AVAILABLE not found"));
            table.setStatusId(availableStatus.getId());
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

        reservation.setReservationTime(dto.getReservationTime());

        if (dto.getStatusId() != null) {
            Param status = paramRepository.findById(dto.getStatusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Status not found with id: " + dto.getStatusId()));
            reservation.setStatusId(status.getId());

            // Release table if CANCELLED
            if ("CANCELLED".equalsIgnoreCase(status.getCode()) && reservation.getTableId() != null) {
                TableEntity table = tableRepository.findById(reservation.getTableId())
                        .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + reservation.getTableId()));
                Param availableStatus = paramRepository.findByTypeAndCode("STATUS", "AVAILABLE")
                        .orElseThrow(() -> new ResourceNotFoundException("Status AVAILABLE not found"));
                table.setStatusId(availableStatus.getId());
                tableRepository.save(table);
            }
        }

        reservationRepository.save(reservation);
        return new ReservationDto(reservation);
    }

    public void deleteReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        if (reservation.getTableId() != null) {
            TableEntity table = tableRepository.findById(reservation.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + reservation.getTableId()));
            Param availableStatus = paramRepository.findByTypeAndCode("STATUS", "AVAILABLE")
                    .orElseThrow(() -> new ResourceNotFoundException("Status AVAILABLE not found"));
            table.setStatusId(availableStatus.getId());
            tableRepository.save(table);
        }

        reservationRepository.delete(reservation);
    }

    public List<TableDto> getAvailableTables() {
        Param availableStatus = paramRepository.findByTypeAndCode("STATUS", "AVAILABLE")
                .orElseThrow(() -> new ResourceNotFoundException("Status AVAILABLE not found"));

        return tableRepository.findByStatusId(availableStatus.getId()).stream()
                .map(TableDto::new)
                .collect(Collectors.toList());
    }
}
