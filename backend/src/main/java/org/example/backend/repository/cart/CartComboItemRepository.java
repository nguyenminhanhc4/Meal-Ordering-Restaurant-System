// CartComboItemRepository.java
package org.example.backend.repository.cart;

import org.example.backend.entity.cart.CartComboItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartComboItemRepository extends JpaRepository<CartComboItem, Long> {
    List<CartComboItem> findByCartId(Long cartId);
    void deleteByCartId(Long cartId);
    Optional<CartComboItem> findByCartIdAndComboId(Long cartId, Long comboId);
}