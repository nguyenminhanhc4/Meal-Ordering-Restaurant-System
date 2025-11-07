// CartComboItemService.java
package org.example.backend.service.cart;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.cart.CartComboItemDto;
import org.example.backend.entity.cart.Cart;
import org.example.backend.entity.cart.CartComboItem;
import org.example.backend.entity.inventory.Inventory;
import org.example.backend.entity.menu.Combo;
import org.example.backend.entity.menu.ComboItem;
import org.example.backend.repository.cart.CartComboItemRepository;
import org.example.backend.repository.cart.CartRepository;
import org.example.backend.repository.inventory.InventoryRepository;
import org.example.backend.repository.menu.ComboRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartComboItemService {

    private final CartComboItemRepository cartComboItemRepository;
    private final ComboRepository comboRepository;
    private final InventoryRepository inventoryRepository;
    private final CartRepository cartRepository;

    public CartComboItemDto save(Long cartId, Long comboId, Integer quantity) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() -> new RuntimeException("Combo not found"));

        // Kiểm tra tồn kho từng món trong combo
        for (ComboItem comboItem : combo.getItems()) {
            Inventory inventory = inventoryRepository.findByMenuItem(comboItem.getMenuItem())
                    .orElseThrow(() -> new RuntimeException("Inventory not found for: " + comboItem.getMenuItem().getName()));

            int required = comboItem.getQuantity() * quantity;
            if (required > inventory.getQuantity()) {
                throw new RuntimeException(
                        "Không đủ tồn kho cho món: " + comboItem.getMenuItem().getName() +
                                " (cần: " + required + ", có: " + inventory.getQuantity() + ")"
                );
            }
        }

        Optional<CartComboItem> existing = cartComboItemRepository.findByCartIdAndComboId(cartId, comboId);
        CartComboItem saved;

        if (existing.isPresent()) {
            int newQty = existing.get().getQuantity() + quantity;
            // Kiểm tra lại tồn kho với số lượng mới
            for (ComboItem ci : combo.getItems()) {
                Inventory inv = inventoryRepository.findByMenuItem(ci.getMenuItem()).get();
                if (ci.getQuantity() * newQty > inv.getQuantity()) {
                    throw new RuntimeException("Vượt quá tồn kho khi tăng số lượng combo");
                }
            }
            existing.get().setQuantity(newQty);
            saved = cartComboItemRepository.save(existing.get());
        } else {
            CartComboItem newItem = CartComboItem.builder()
                    .cart(cart)
                    .combo(combo)
                    .quantity(quantity)
                    .build();
            saved = cartComboItemRepository.save(newItem);
        }

        return new CartComboItemDto(saved);
    }

    public List<CartComboItemDto> findByCartId(Long cartId) {
        return cartComboItemRepository.findByCartId(cartId)
                .stream()
                .map(CartComboItemDto::new)
                .collect(Collectors.toList());
    }

    public void deleteById(Long id) {
        cartComboItemRepository.deleteById(id);
    }

    public void clearCartCombos(Long cartId) {
        List<CartComboItem> items = cartComboItemRepository.findByCartId(cartId);
        if (!items.isEmpty()) {
            cartComboItemRepository.deleteAll(items);
        }
    }
}