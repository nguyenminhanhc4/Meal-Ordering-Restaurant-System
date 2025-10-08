package org.example.backend.service.reservation;

import lombok.Getter;
import org.example.backend.dto.reservation.ReservationDto;
import org.example.backend.dto.table.TableDto;
import org.example.backend.dto.table.TableStatusUpdate;
import org.example.backend.entity.param.Param;
import org.example.backend.entity.reservation.Reservation;
import org.example.backend.entity.table.TableEntity;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.param.ParamRepository;
import org.example.backend.repository.reservation.ReservationRepository;
import org.example.backend.repository.table.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private ParamRepository paramRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // ========================= CREATE =========================
    @Transactional
    public ReservationDto createMyReservation(Long userId, ReservationDto dto) {
        try {
            Reservation reservation = new Reservation();
            reservation.setPublicId(UUID.randomUUID().toString());
            reservation.setUserId(userId);
            reservation.setReservationTime(dto.getReservationTime());
            reservation.setNumberOfPeople(dto.getNumberOfPeople());
            reservation.setNote(dto.getNote());

            // Default status = CONFIRMED
            Param status = paramRepository.findByTypeAndCode("STATUS_RESERVATION", "CONFIRMED")
                    .orElseThrow(() -> new ResourceNotFoundException("Status CONFIRMED not found"));
            reservation.setStatusId(status.getId());
            reservationRepository.save(reservation);

            // Merge tables logic
            MergeTableResult result = mergeTables(dto.getTableIds(), dto.getNumberOfPeople());
            if (!result.isEnough()) {
                throw new IllegalStateException(
                        "Not enough seats for " + dto.getNumberOfPeople() + " people");
            }

            // Mark tables occupied and link them
            Param occupiedStatus = paramRepository.findByTypeAndCode("STATUS_TABLE", "OCCUPIED")
                    .orElseThrow(() -> new ResourceNotFoundException("Status OCCUPIED not found"));

            for (TableEntity table : result.getAllocatedTables()) {
                table.setStatus(occupiedStatus); // ✅ thay vì setStatusId()
                tableRepository.save(table);

                messagingTemplate.convertAndSend("/topic/tables",
                        new TableStatusUpdate(table.getId(), occupiedStatus.getId()));
            }

            reservation.setTables(new HashSet<>(result.getAllocatedTables()));
            reservationRepository.save(reservation);

            return new ReservationDto(reservation);

        } catch (IllegalStateException e) {
            throw new RuntimeException(e.getMessage());
        } catch (ResourceNotFoundException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    // ========================= READ =========================
    @Transactional(readOnly = true)
    public List<ReservationDto> getMyReservations(Long userId) {
        return reservationRepository.findAll().stream()
                .filter(r -> r.getUserId().equals(userId))
                .map(ReservationDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReservationDto getReservationByPublicId(String publicId) {
        Reservation reservation = reservationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with publicId: " + publicId));
        return new ReservationDto(reservation);
    }

    @Transactional(readOnly = true)
    public List<ReservationDto> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(ReservationDto::new)
                .collect(Collectors.toList());
    }

    // ========================= UPDATE =========================
    @Transactional
    public ReservationDto updateMyReservation(String publicId, ReservationDto dto) {
        Reservation reservation = reservationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with publicId: " + publicId));

        reservation.setReservationTime(dto.getReservationTime());

        if (dto.getStatusId() != null) {
            Param status = paramRepository.findById(dto.getStatusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Status not found with id: " + dto.getStatusId()));
            reservation.setStatusId(status.getId());

            if ("CANCELLED".equalsIgnoreCase(status.getCode())) {
                releaseTables(reservation);
            }
        }

        reservationRepository.save(reservation);
        return new ReservationDto(reservation);
    }

    @Transactional
    public ReservationDto updateReservation(Long id, ReservationDto dto) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        reservation.setReservationTime(dto.getReservationTime());

        if (dto.getStatusId() != null) {
            Param status = paramRepository.findById(dto.getStatusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Status not found with id: " + dto.getStatusId()));
            reservation.setStatusId(status.getId());

            if ("CANCELLED".equalsIgnoreCase(status.getCode())) {
                releaseTables(reservation);
            }
        }

        reservationRepository.save(reservation);
        return new ReservationDto(reservation);
    }

    // ========================= DELETE =========================
    @Transactional
    public void deleteMyReservation(String publicId) {
        Reservation reservation = reservationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with publicId: " + publicId));

        releaseTables(reservation);
        reservationRepository.delete(reservation);
    }

    @Transactional
    public void deleteReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        releaseTables(reservation);
        reservationRepository.delete(reservation);
    }

    // ========================= UTILS =========================
    @Transactional(readOnly = true)
    public List<TableDto> getAvailableTables() {
        Param availableStatus = paramRepository.findByTypeAndCode("STATUS_TABLE", "AVAILABLE")
                .orElseThrow(() -> new ResourceNotFoundException("Status AVAILABLE not found"));

        // ✅ sửa để dùng table.getStatus().getId()
        return tableRepository.findAll().stream()
                .filter(t -> t.getStatus() != null && Objects.equals(t.getStatus().getId(), availableStatus.getId()))
                .map(TableDto::new)
                .collect(Collectors.toList());
    }

    private void releaseTables(Reservation reservation) {
        Param availableStatus = paramRepository.findByTypeAndCode("STATUS_TABLE", "AVAILABLE")
                .orElseThrow(() -> new ResourceNotFoundException("Status AVAILABLE not found"));

        for (TableEntity table : reservation.getTables()) {
            table.setStatus(availableStatus); // ✅ thay vì setStatusId()
            tableRepository.save(table);

            messagingTemplate.convertAndSend("/topic/tables",
                    new TableStatusUpdate(table.getId(), availableStatus.getId()));
        }

        reservation.getTables().clear();
        reservationRepository.save(reservation);
    }

    @Getter
    private static class MergeTableResult {
        private final List<TableEntity> allocatedTables;
        private final boolean enough;

        public MergeTableResult(List<TableEntity> allocatedTables, boolean enough) {
            this.allocatedTables = allocatedTables;
            this.enough = enough;
        }
    }

    public MergeTableResult mergeTables(List<Long> tableIds, int numberOfPeople) {
        List<TableEntity> allocatedTables = new ArrayList<>();
        int totalSeats = 0;

        for (Long tableId : tableIds) {
            TableEntity table = tableRepository.findById(tableId)
                    .orElseThrow(() -> new ResourceNotFoundException("Table with id " + tableId + " not found"));

            Param occupiedStatus = paramRepository.findByTypeAndCode("STATUS_TABLE", "OCCUPIED")
                    .orElseThrow(() -> new ResourceNotFoundException("Status OCCUPIED not found"));

            if (table.getStatus() != null && Objects.equals(table.getStatus().getId(), occupiedStatus.getId())) {
                throw new IllegalStateException("Table with id " + tableId + " is already occupied");
            }

            totalSeats += table.getCapacity();
            allocatedTables.add(table);
        }

        if (totalSeats < numberOfPeople) {
            throw new IllegalStateException("Not enough seats for " + numberOfPeople + " people");
        }

        return new MergeTableResult(allocatedTables, true);
    }
}
