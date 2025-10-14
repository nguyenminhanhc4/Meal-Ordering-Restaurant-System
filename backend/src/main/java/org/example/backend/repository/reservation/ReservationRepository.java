package org.example.backend.repository.reservation;

import org.example.backend.entity.reservation.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Optional<Reservation> findByPublicId(String publicId);
    Page<Reservation> findByUserId(Long userId, Pageable pageable);
    @Query("SELECT r FROM Reservation r WHERE r.userId = :userId AND r.status.code = :statusCode")
    Page<Reservation> findByUserIdAndStatusCode(
            @Param("userId") Long userId,
            @Param("statusCode") String statusCode,
            Pageable pageable
    );
}
