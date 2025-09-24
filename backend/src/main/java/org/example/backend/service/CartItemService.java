package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.CartItemDto;
import org.example.backend.entity.CartItem;
import org.example.backend.repository.CartItemRepository;
import org.example.backend.repository.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartItemService {

    private final CartItemRepository cartItemRepository;

    private final MenuItemRepository menuItemRepository;

    public List<CartItemDto> findAll() {
        return cartItemRepository.findAll()
                .stream()
                .map(CartItemDto::new)
                .collect(Collectors.toList());
    }

    public Optional<CartItemDto> findById(Long id) {
        return cartItemRepository.findById(id).map(CartItemDto::new);
    }

    public CartItemDto save(CartItemDto dto) {
        CartItem entity = toEntity(dto);
        entity = cartItemRepository.save(entity);
        return new CartItemDto(entity);
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

    private CartItem toEntity(CartItemDto dto) {
        CartItem entity = new CartItem();
        entity.setId(dto.getId());
        entity.setQuantity(dto.getQuantity());
        entity.setMenuItem(menuItemRepository.getById(dto.getMenuItemId()));
        return entity;
    }
}
