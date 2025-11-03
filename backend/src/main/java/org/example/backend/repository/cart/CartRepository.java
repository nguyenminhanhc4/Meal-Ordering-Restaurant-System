package org.example.backend.repository.cart;

import org.example.backend.entity.cart.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    @Query("""
  SELECT DISTINCT c FROM Cart c
  LEFT JOIN FETCH c.items i
  LEFT JOIN FETCH i.menuItem m
  WHERE c.user.publicId = :publicId
    AND c.status.code = :statusCode
""")
    Optional<Cart> findByUserPublicIdWithItemsAndStatus(
            @Param("publicId") String publicId,
            @Param("statusCode") String statusCode
    );

    @Query("""
    SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END
    FROM Cart c
    WHERE c.user.publicId = :publicId
      AND c.status.code = :statusCode
""")
    boolean existsByUserPublicIdAndStatus(@Param("publicId") String publicId,
                                          @Param("statusCode") String statusCode);


}
