package org.example.backend.service.cart;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.cart.CartItemDto;
import org.example.backend.entity.cart.Cart;
import org.example.backend.entity.cart.CartItem;
import org.example.backend.entity.inventory.Inventory;
import org.example.backend.entity.menu.MenuItem;
import org.example.backend.repository.cart.CartItemRepository;
import org.example.backend.repository.cart.CartRepository;
import org.example.backend.repository.inventory.InventoryRepository;
import org.example.backend.repository.menu.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartItemService {

    private final CartItemRepository cartItemRepository;

    private final MenuItemRepository menuItemRepository;

    private final InventoryRepository inventoryRepository;

    private final CartRepository cartRepository;

    public List<CartItemDto> findAll() {
        return cartItemRepository.findAll()
                .stream()
                .map(CartItemDto::new)
                .collect(Collectors.toList());
    }

    public Optional<CartItemDto> findById(Long id) {
        return cartItemRepository.findById(id).map(CartItemDto::new);
    }

    public CartItemDto save(Long cartId, CartItemDto dto) {
        // Lấy giỏ hàng
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        // Lấy món ăn + tồn kho
        MenuItem menuItem = menuItemRepository.findById(dto.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("MenuItem not found"));
        Inventory inventory = inventoryRepository.findByMenuItem(menuItem)
                .orElseThrow(() -> new RuntimeException("Inventory not found for menu item: " + menuItem.getName()));

        // Kiểm tra trùng item
        Optional<CartItem> existingOpt  = cartItemRepository.findByCartIdAndMenuItemId(cartId, dto.getMenuItemId());
        CartItem saved;

        if (existingOpt.isPresent()) {
            CartItem existing = existingOpt.get();
            int newQuantity = existing.getQuantity() + dto.getQuantity();

            // 🔒 Kiểm tra tồn kho
            if (newQuantity > inventory.getQuantity()) {
                throw new RuntimeException("Số lượng vượt quá tồn kho cho món: " + menuItem.getName());
            }

            existing.setQuantity(newQuantity);
            saved = cartItemRepository.save(existing);
        } else {
            // 🔒 Kiểm tra tồn kho
            if (dto.getQuantity() > inventory.getQuantity()) {
                throw new RuntimeException("Số lượng vượt quá tồn kho cho món: " + menuItem.getName());
            }

            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setMenuItem(menuItem);
            newItem.setQuantity(dto.getQuantity());
            saved = cartItemRepository.save(newItem);
        }
        return new CartItemDto(saved);
    }


    public CartItemDto updateById(Long id, CartItemDto dto) {
        CartItem entity = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));

        entity.setQuantity(dto.getQuantity());
        entity = cartItemRepository.save(entity);
        return new CartItemDto(entity);
    }

    public void deleteById(Long id) {
        CartItem entity = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));
        cartItemRepository.delete(entity);
    }

    public void deleteByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("Danh sách id không được rỗng");
        }
        cartItemRepository.deleteAllById(ids);
    }

    public void clearCart(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        List<CartItem> items = cartItemRepository.findByCartId(cartId);
        if (items.isEmpty()) {
            return; // không có gì để xóa
        }
        cartItemRepository.deleteAll(items);
    }

    private CartItem toEntity(CartItemDto dto) {
        CartItem entity = new CartItem();
        entity.setId(dto.getId());
        entity.setQuantity(dto.getQuantity());
        entity.setMenuItem(menuItemRepository.getById(dto.getMenuItemId()));
        return entity;
    }
}
