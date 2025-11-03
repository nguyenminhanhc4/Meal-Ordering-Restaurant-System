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
        // Lấy tất cả CartItem trong DB và map sang DTO
        return cartItemRepository.findAll()
                .stream()
                .map(CartItemDto::new)
                .collect(Collectors.toList());
    }

    public Optional<CartItemDto> findById(Long id) {
        // Tìm CartItem theo id, nếu tồn tại thì map sang DTO
        return cartItemRepository.findById(id).map(CartItemDto::new);
    }

    public CartItemDto save(Long cartId, CartItemDto dto) {
        // Thêm hoặc cập nhật 1 CartItem vào cart: kiểm tra tồn tại cart, menuItem, inventory, rồi tăng số lượng nếu đã có item, hoặc tạo mới
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        MenuItem menuItem = menuItemRepository.findById(dto.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("MenuItem not found"));
        Inventory inventory = inventoryRepository.findByMenuItem(menuItem)
                .orElseThrow(() -> new RuntimeException("Inventory not found for menu item: " + menuItem.getName()));

        Optional<CartItem> existingOpt  = cartItemRepository.findByCartIdAndMenuItemId(cartId, dto.getMenuItemId());
        CartItem saved;

        if (existingOpt.isPresent()) {
            int newQuantity = existingOpt.get().getQuantity() + dto.getQuantity();
            if (newQuantity > inventory.getQuantity()) {
                throw new RuntimeException("Số lượng vượt quá tồn kho cho món: " + menuItem.getName());
            }
            existingOpt.get().setQuantity(newQuantity);
            saved = cartItemRepository.save(existingOpt.get());
        } else {
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
        // Cập nhật số lượng CartItem theo id
        CartItem entity = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));
        entity.setQuantity(dto.getQuantity());
        return new CartItemDto(cartItemRepository.save(entity));
    }

    public void deleteById(Long id) {
        // Xóa 1 CartItem theo id sau khi kiểm tra tồn tại
        CartItem entity = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));
        cartItemRepository.delete(entity);
    }

    public void deleteByIds(List<Long> ids) {
        // Xóa nhiều CartItem theo danh sách id, validate danh sách không rỗng
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("Danh sách id không được rỗng");
        }
        cartItemRepository.deleteAllById(ids);
    }

    public void clearCart(Long cartId) {
        // Xóa tất cả CartItem trong 1 cart, nếu cart tồn tại và có item
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        List<CartItem> items = cartItemRepository.findByCartId(cartId);
        if (!items.isEmpty()) {
            cartItemRepository.deleteAll(items);
        }
    }

    private CartItem toEntity(CartItemDto dto) {
        // Chuyển CartItemDto sang entity (dùng nội bộ)
        CartItem entity = new CartItem();
        entity.setId(dto.getId());
        entity.setQuantity(dto.getQuantity());
        entity.setMenuItem(menuItemRepository.getById(dto.getMenuItemId()));
        return entity;
    }
}

