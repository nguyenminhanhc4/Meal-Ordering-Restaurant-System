package org.example.backend.service.reservation;

import jakarta.persistence.Table;
import lombok.Getter;
import org.example.backend.dto.reservation.ReservationDto;
import org.example.backend.dto.table.TableDto;
import org.example.backend.dto.table.TableStatusUpdate;
import org.example.backend.entity.param.Param;
import org.example.backend.entity.reservation.Reservation;
import org.example.backend.entity.table.TableEntity;
import org.example.backend.entity.user.User;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.param.ParamRepository;
import org.example.backend.repository.reservation.ReservationRepository;
import org.example.backend.repository.reservation.ReservationSpecification;
import org.example.backend.repository.table.TableRepository;
import org.example.backend.repository.user.UserRepository;
import org.example.backend.service.notification.NotificationService;
import org.example.backend.util.WebSocketNotifier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
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
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private WebSocketNotifier webSocketNotifier;

    @Autowired
    private NotificationService notificationService;

    // ========================= CREATE =========================
    @Transactional
    public ReservationDto createMyReservation(Long userId, ReservationDto dto) {
        try {
            // 1. Tạo reservation mới
            Reservation reservation = new Reservation();
            reservation.setPublicId(UUID.randomUUID().toString());
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            reservation.setUser(user);
            reservation.setReservationTime(dto.getReservationTime());
            reservation.setNumberOfPeople(dto.getNumberOfPeople());
            reservation.setNote(dto.getNote());

            Param status = paramRepository.findByTypeAndCode("STATUS_RESERVATION", "PENDING")
                    .orElseThrow(() -> new ResourceNotFoundException("Status CONFIRMED not found"));
            reservation.setStatus(status);

            reservationRepository.save(reservation);

            // 2. Merge tables
            MergeTableResult result = mergeTables(dto.getTableIds(), dto.getNumberOfPeople());
            if (!result.isEnough()) {
                throw new IllegalStateException("Not enough seats for " + dto.getNumberOfPeople() + " people");
            }

            // 3. Pessimistic lock + kiểm tra bàn còn trống
            List<TableEntity> tablesToReserve = tableRepository.findAllById(result.getAllocatedTables()
                    .stream().map(TableEntity::getId).toList());

            for (TableEntity table : tablesToReserve) {
                if (!table.getStatus().getCode().equals("AVAILABLE")) {
                    throw new IllegalStateException("Table " + table.getId() + " is already reserved");
                }
            }

            // 4. Update status bàn
            Param occupiedStatus = paramRepository.findByTypeAndCode("STATUS_TABLE", "OCCUPIED")
                    .orElseThrow(() -> new ResourceNotFoundException("Status OCCUPIED not found"));

            tablesToReserve.forEach(table -> table.setStatus(occupiedStatus));
            tableRepository.saveAll(tablesToReserve);

            // 5. Link tables với reservation
            reservation.setTables(new HashSet<>(tablesToReserve));
            reservationRepository.save(reservation);

            // 6. Gửi WebSocket sau commit
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
                @Override
                public void afterCommit() {
                    for (TableEntity table : tablesToReserve) {
                        messagingTemplate.convertAndSend("/topic/tables",
                                new TableStatusUpdate(table.getId(), occupiedStatus.getId()));
                    }

                    messagingTemplate.convertAndSend("/topic/reservations", Map.of(
                            "reservationPublicId", reservation.getPublicId(),
                            "status", reservation.getStatus().getCode()
                    ));
                }
            });

            notificationService.notifyNewReservation(reservation);

            return new ReservationDto(reservation);

        } catch (IllegalStateException e) {
            throw new RuntimeException(e.getMessage());
        } catch (ResourceNotFoundException e) {
            throw new RuntimeException(e.getMessage());
        }
    }


    // ========================= READ =========================
    public Page<ReservationDto> findMyReservations(Long userId, String status, Pageable pageable) {
        Page<Reservation> page;

        if (status != null && !status.isBlank()) {
            page = reservationRepository.findByUserIdAndStatusCode(userId, status, pageable);
        } else {
            page = reservationRepository.findByUserId(userId, pageable);
        }

        return page.map(ReservationDto::new);
    }

    public Page<ReservationDto> getReservations(
            String keyword,
            Long statusId,
            LocalDateTime from,
            LocalDateTime to,
            Integer numberOfPeople,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Reservation> reservations = reservationRepository.findAllWithCustomSort(
                keyword,
                statusId,
                from,
                to,
                numberOfPeople,
                pageable
        );

        return reservations.map(ReservationDto::new);
    }


    // 🎯 Helper function: xác định độ ưu tiên của status
    private int getStatusPriority(String code) {
        return switch (code) {
            case "PENDING" -> 1;
            case "CONFIRMED" -> 2;
            case "COMPLETED" -> 3;
            case "CANCELLED" -> 4;
            default -> 5;
        };
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

        // ✅ Cập nhật thời gian nếu có
        if (dto.getReservationTime() != null) {
            reservation.setReservationTime(dto.getReservationTime());
        }

        // ✅ Cập nhật số lượng người
        if (dto.getNumberOfPeople() != null) {
            reservation.setNumberOfPeople(dto.getNumberOfPeople());
        }

        // ✅ Cập nhật ghi chú nếu có
        if (dto.getNote() != null) {
            reservation.setNote(dto.getNote());
        }

        // ✅ Cập nhật status nếu có
        if (dto.getStatusId() != null || dto.getStatusName() != null) {
            Param status = null;

            if (dto.getStatusId() != null) {
                status = paramRepository.findById(dto.getStatusId())
                        .orElseThrow(() -> new ResourceNotFoundException("Status not found with id: " + dto.getStatusId()));
            } else {
                status = paramRepository.findByTypeAndCode("STATUS_RESERVATION",dto.getStatusName())
                        .orElseThrow(() -> new ResourceNotFoundException("Status not found with code: " + dto.getStatusName()));
            }

            reservation.setStatus(status);

            if ("CANCELLED".equalsIgnoreCase(status.getCode())) {
                releaseTables(reservation);
            }
        }

        // ✅ Cập nhật danh sách bàn nếu có
        if (dto.getTableIds() != null && !dto.getTableIds().isEmpty()) {
            List<TableEntity> tables = tableRepository.findAllById(dto.getTableIds());
            reservation.setTables(new HashSet<>(tables));
        }

        Reservation updated = reservationRepository.save(reservation);
        return new ReservationDto(updated);
    }

    public ReservationDto updateStatus(String publicId, String newStatus) {
        Reservation reservation = reservationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        Param status = paramRepository.findByTypeAndCode("STATUS_RESERVATION",newStatus)
                .orElseThrow(() -> new RuntimeException("Status not found: " + newStatus));
        reservation.setStatus(status);
        reservation.setUpdatedAt(LocalDateTime.now());

        Reservation updated = reservationRepository.save(reservation);

        webSocketNotifier.notifyReservationStatus(publicId, newStatus);
        switch (newStatus) {
            case "CONFIRMED":
                notificationService.notifyReservationApproved(updated);
                break;
            case "CANCELLED":
                notificationService.notifyReservationCancelled(updated);
                break;
            default:
                // Không gửi notification cho các trạng thái khác
                break;
        }
        return new ReservationDto(updated);
    }

    @Transactional
    public ReservationDto markAsCompleted(String publicId) {
        Reservation reservation = reservationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        // 1️⃣ Cập nhật trạng thái đặt bàn
        Param completedStatus = paramRepository.findByTypeAndCode("STATUS_RESERVATION","COMPLETED")
                .orElseThrow(() -> new RuntimeException("Status COMPLETED not found"));
        reservation.setStatus(completedStatus);

        // 2️⃣ Cập nhật trạng thái các bàn về "AVAILABLE"
        for (TableEntity table : reservation.getTables()) {
            Param available = paramRepository.findByTypeAndCode("STATUS_TABLE","AVAILABLE")
                    .orElseThrow(() -> new RuntimeException("Table status AVAILABLE not found"));
            table.setStatus(available);
            tableRepository.save(table);
        }

        Reservation saved = reservationRepository.save(reservation);

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
            @Override
            public void afterCommit() {
                webSocketNotifier.notifyReservationStatus(publicId, "COMPLETED");
                reservation.getTables().forEach(table ->
                        webSocketNotifier.notifyTableStatus(table.getId(), "AVAILABLE")
                );
            }
        });
        notificationService.notifyReservationCompleted(saved);
        return new ReservationDto(saved);
    }

    @Transactional
    public ReservationDto updateReservation(Long id, ReservationDto dto) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));

        // Cập nhật giờ
        reservation.setReservationTime(dto.getReservationTime());

        // Cập nhật số người
        reservation.setNumberOfPeople(dto.getNumberOfPeople());

        // Cập nhật ghi chú
        if (dto.getNote() != null) {
            reservation.setNote(dto.getNote());
        }

        // Cập nhật bàn
        if (dto.getTableIds() != null && !dto.getTableIds().isEmpty()) {
            List<TableEntity> tables = tableRepository.findAllById(dto.getTableIds());
            reservation.setTables((Set<TableEntity>) tables);
        }

        // Cập nhật trạng thái
        if (dto.getStatusId() != null) {
            Param status = paramRepository.findById(dto.getStatusId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Status not found with id: " + dto.getStatusId()));
            reservation.setStatus(status);

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
        //reservation.getTables().clear();
        //reservationRepository.save(reservation);
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
