package org.example.backend.service.reservation;

import org.example.backend.dto.reservation.ReservationDto;
import org.example.backend.dto.table.TableDto;
import org.example.backend.entity.param.Param;
import org.example.backend.entity.reservation.Reservation;
import org.example.backend.entity.table.TableEntity;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.param.ParamRepository;
import org.example.backend.repository.reservation.ReservationRepository;
import org.example.backend.repository.table.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    // ========================= CREATE =========================
    @Transactional
    public ReservationDto createMyReservation(Long userId, ReservationDto dto) {
        Reservation reservation = new Reservation();
        reservation.setPublicId(UUID.randomUUID().toString());
        reservation.setUserId(userId);
        reservation.setReservationTime(dto.getReservationTime());
        reservation.setNumberOfPeople(dto.getNumberOfPeople());
        reservation.setNote(dto.getNote());

        // Default status = CONFIRMED
        Param status = paramRepository.findByTypeAndCode("STATUS", "CONFIRMED")
                .orElseThrow(() -> new ResourceNotFoundException("Status CONFIRMED not found"));
        reservation.setStatusId(status.getId());
        reservationRepository.save(reservation);

        // Merge tables logic
        MergeTableResult result = mergeTables(dto.getTableIds(), dto.getNumberOfPeople());
        if (!result.isEnough()) {
            throw new IllegalStateException("Not enough seats for " + dto.getNumberOfPeople() + " people");
        }

        // Mark tables occupied and link them
        Param occupiedStatus = paramRepository.findByTypeAndCode("STATUS", "OCCUPIED")
                .orElseThrow(() -> new ResourceNotFoundException("Status OCCUPIED not found"));

        for (TableEntity table : result.getAllocatedTables()) {
            table.setStatusId(occupiedStatus.getId());
            tableRepository.save(table);
        }

        reservation.setTables(new HashSet<>(result.getAllocatedTables()));
        reservationRepository.save(reservation);

        return new ReservationDto(reservation);
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

            // If cancelled -> free tables
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
        Param availableStatus = paramRepository.findByTypeAndCode("STATUS", "AVAILABLE")
                .orElseThrow(() -> new ResourceNotFoundException("Status AVAILABLE not found"));

        return tableRepository.findByStatusId(availableStatus.getId()).stream()
                .map(TableDto::new)
                .collect(Collectors.toList());
    }

    private void releaseTables(Reservation reservation) {
        Param availableStatus = paramRepository.findByTypeAndCode("STATUS", "AVAILABLE")
                .orElseThrow(() -> new ResourceNotFoundException("Status AVAILABLE not found"));

        for (TableEntity table : reservation.getTables()) {
            table.setStatusId(availableStatus.getId());
            tableRepository.save(table);
        }

        reservation.getTables().clear();
        reservationRepository.save(reservation);
    }

    private class MergeTableResult {
        private final List<TableEntity> allocatedTables;
        private final boolean enough;

        public MergeTableResult(List<TableEntity> allocatedTables, boolean enough) {
            this.allocatedTables = allocatedTables;
            this.enough = enough;
        }

        public List<TableEntity> getAllocatedTables() { return allocatedTables; }
        public boolean isEnough() { return enough; }
    }

    private MergeTableResult mergeTables(List<Long> tableIds, int requiredSeats) {
        List<TableEntity> allocated = new ArrayList<>();
        int totalCapacity = 0;

        if (tableIds != null) {
            for (Long tableId : tableIds) {
                TableEntity table = tableRepository.findById(tableId)
                        .orElseThrow(() -> new ResourceNotFoundException("Table not found with id: " + tableId));

                allocated.add(table);
                totalCapacity += table.getCapacity();

                if (totalCapacity >= requiredSeats) {
                    return new MergeTableResult(allocated, true);
                }
            }
        }
        return new MergeTableResult(allocated, false);
    }
}
