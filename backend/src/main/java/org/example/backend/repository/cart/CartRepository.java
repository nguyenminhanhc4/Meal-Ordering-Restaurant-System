package org.example.backend.repository.cart;

import org.example.backend.entity.cart.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserIdAndStatus_Code(Long userId, String statusCode);
}
