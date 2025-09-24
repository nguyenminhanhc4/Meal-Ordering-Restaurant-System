package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.CartDto;
import org.example.backend.entity.Cart;
import org.example.backend.repository.CartRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;

    private final UserRepository userRepository;

    public List<CartDto> findAll() {
        return cartRepository.findAll()
                .stream()
                .map(CartDto::new)
                .collect(Collectors.toList());
    }

    public Optional<CartDto> findById(Long id) {
        return cartRepository.findById(id).map(CartDto::new);
    }

    public CartDto save(CartDto dto) {
        Cart cart = toEntity(dto);
        cart = cartRepository.save(cart);
        return new CartDto(cart);
    }

    public CartDto updateById(Long id, CartDto dto) {
        Cart cart = cartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.setStatus(null);
        cart = cartRepository.save(cart);
        return new CartDto(cart);
    }

    public void deleteById(Long id) {
        Cart cart = cartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        cartRepository.delete(cart);
    }

    private Cart toEntity(CartDto dto) {
        Cart entity = new Cart();
        entity.setId(dto.getId());
        entity.setUser(userRepository.getById(dto.getUserId()));
        return entity;
    }
}
