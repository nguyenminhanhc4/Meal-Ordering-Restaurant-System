package org.example.backend.controller.reservation;

import org.example.backend.dto.reservation.ReservationDto;
import org.example.backend.dto.Response;
import org.example.backend.dto.table.TableDto;
import org.example.backend.service.reservation.ReservationService;
import org.example.backend.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private UserService userService;

    // CUSTOMER creates reservation for themselves
    @PostMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createMyReservation(@RequestBody ReservationDto dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            Long userId = userService.getUserByEmail(email).getId();

            ReservationDto created = reservationService.createMyReservation(userId, dto);

            return ResponseEntity.ok(
                    new Response<>("success", created, "Reservation created successfully")
            );

        } catch (RuntimeException e) {
            // RuntimeException từ service khi bàn đã được đặt hoặc không đủ chỗ
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new Response<>("error", null, e.getMessage()));
        } catch (Exception e) {
            // các lỗi khác
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new Response<>("error", null, "Internal server error"));
        }
    }

    // CUSTOMER gets all their reservations
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getMyReservations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @RequestParam(required = false) String status
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Long userId = userService.getUserByEmail(email).getId();

        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1
                ? Sort.Direction.fromString(sortParts[1])
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParts[0]));

        Page<ReservationDto> reservations = reservationService.findMyReservations(userId, status, pageable);

        return ResponseEntity.ok(new Response<>("success", reservations, "Reservations retrieved successfully"));
    }



    // CUSTOMER gets their reservation by publicId
    @GetMapping("/me/{publicId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getMyReservation(@PathVariable String publicId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Long userId = userService.getUserByEmail(email).getId();

        ReservationDto reservation = reservationService.getReservationByPublicId(publicId);
        if (!reservation.getUserId().equals(userId)) {
            return ResponseEntity.status(403)
                    .body(new Response<>("error", null, "You are not allowed to view this reservation"));
        }
        return ResponseEntity.ok(new Response<>("success", reservation, "Reservation retrieved successfully"));
    }

    // CUSTOMER updates their own reservation
    @PutMapping("/me/{publicId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> updateMyReservation(@PathVariable String publicId, @RequestBody ReservationDto dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Long userId = userService.getUserByEmail(email).getId();

        ReservationDto existing = reservationService.getReservationByPublicId(publicId);
        if (!existing.getUserId().equals(userId)) {
            return ResponseEntity.status(403)
                    .body(new Response<>("error", null, "You are not allowed to update this reservation"));
        }

        ReservationDto updated = reservationService.updateMyReservation(publicId, dto);
        return ResponseEntity.ok(new Response<>("success", updated, "Reservation updated successfully"));
    }

    // CUSTOMER deletes their own reservation
    @DeleteMapping("/me/{publicId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> deleteMyReservation(@PathVariable String publicId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Long userId = userService.getUserByEmail(email).getId();

        ReservationDto existing = reservationService.getReservationByPublicId(publicId);
        if (!existing.getUserId().equals(userId)) {
            return ResponseEntity.status(403)
                    .body(new Response<>("error", null, "You are not allowed to delete this reservation"));
        }

        reservationService.deleteMyReservation(publicId);
        return ResponseEntity.ok(new Response<>("success", null, "Reservation deleted successfully"));
    }

    // STAFF or ADMIN can see all reservations
    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ResponseEntity<?> getAllReservations() {
        List<ReservationDto> list = reservationService.getAllReservations();
        return ResponseEntity.ok(new Response<>("success", list, "All reservations retrieved successfully"));
    }

    // STAFF or ADMIN can update any reservation
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ResponseEntity<?> updateReservation(@PathVariable Long id, @RequestBody ReservationDto dto) {
        ReservationDto updated = reservationService.updateReservation(id, dto);
        return ResponseEntity.ok(new Response<>("success", updated, "Reservation updated successfully"));
    }

    // STAFF or ADMIN can delete any reservation
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ResponseEntity<?> deleteReservation(@PathVariable Long id) {
        reservationService.deleteReservation(id);
        return ResponseEntity.ok(new Response<>("success", null, "Reservation deleted successfully"));
    }

    // Any authenticated user can view available tables
    @GetMapping("/tables/available")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAvailableTables() {
        List<TableDto> tables = reservationService.getAvailableTables();
        return ResponseEntity.ok(new Response<>("success", tables, "Available tables retrieved successfully"));
    }
}
