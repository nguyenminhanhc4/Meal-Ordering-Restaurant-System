package org.example.backend.repository.cart;

import org.example.backend.entity.cart.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    @Query("""
    SELECT c FROM Cart c
    LEFT JOIN FETCH c.items i
    LEFT JOIN FETCH i.menuItem m
    WHERE c.user.publicId = :publicId
  """)
    Optional<Cart> findByUserPublicIdWithItems(String publicId);

}
