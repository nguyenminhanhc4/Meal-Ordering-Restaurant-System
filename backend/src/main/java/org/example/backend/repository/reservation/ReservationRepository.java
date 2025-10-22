package org.example.backend.repository.reservation;

import org.example.backend.entity.reservation.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long>,
        JpaSpecificationExecutor<Reservation> {
    Optional<Reservation> findByPublicId(String publicId);
    Page<Reservation> findByUserId(Long userId, Pageable pageable);
    @Query("SELECT r FROM Reservation r WHERE r.user.id = :userId AND r.status.code = :statusCode")
    Page<Reservation> findByUserIdAndStatusCode(
            @Param("userId") Long userId,
            @Param("statusCode") String statusCode,
            Pageable pageable
    );

    @Query("""
    SELECT r FROM Reservation r
    WHERE (:keyword IS NULL OR LOWER(r.user.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
      AND (:statusId IS NULL OR r.status.id = :statusId)
      AND (:from IS NULL OR r.reservationTime >= :from)
      AND (:to IS NULL OR r.reservationTime <= :to)
      AND (:numberOfPeople IS NULL OR r.numberOfPeople = :numberOfPeople)
    ORDER BY 
      CASE r.status.code 
        WHEN 'PENDING' THEN 1
        WHEN 'CONFIRMED' THEN 2
        WHEN 'COMPLETED' THEN 3
        WHEN 'CANCELLED' THEN 4
        ELSE 5
      END,
      r.createdAt DESC
""")
    Page<Reservation> findAllWithCustomSort(
            @Param("keyword") String keyword,
            @Param("statusId") Long statusId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("numberOfPeople") Integer numberOfPeople,
            Pageable pageable
    );

}
