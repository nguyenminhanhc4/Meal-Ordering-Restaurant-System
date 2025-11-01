package org.example.backend.service.cart;

import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.cart.CartDto;
import org.example.backend.dto.cart.CartItemDto;
import org.example.backend.entity.cart.Cart;
import org.example.backend.entity.cart.CartItem;
import org.example.backend.entity.param.Param;
import org.example.backend.entity.user.User;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.cart.CartRepository;
import org.example.backend.repository.param.ParamRepository;
import org.example.backend.repository.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;

    private final UserRepository userRepository;

    private final ParamRepository paramRepository;

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
        try {
            Cart cart = toEntity(dto);
            cart = cartRepository.save(cart);
            return new CartDto(cart);
        } catch (ResourceNotFoundException | ValidationException ex) {
            throw ex; // ném tiếp để GlobalExceptionHandler xử lý
        } catch (Exception ex) {
            // log lỗi
            throw new RuntimeException("Unexpected error while saving cart", ex);
        }
    }

    public CartDto getCurrentCart(String publicId) {
        Cart cart = cartRepository.findByUserPublicIdWithItemsAndStatus(publicId, "OPEN")
                .orElseThrow(() -> new ResourceNotFoundException("No open cart found"));
        return new CartDto(cart);
    }

    public CartDto createCartForUser(String publicId) {
        boolean hasActiveCart = cartRepository.existsByUserPublicIdAndStatus(publicId, "OPEN");
        if (hasActiveCart) {
            throw new ValidationException("User already has an active cart");
        }

        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Param openStatus = paramRepository.findByTypeAndCode("STATUS_CART", "OPEN")
                .orElseThrow(() -> new RuntimeException("Default status not found"));

        Cart cart = new Cart();
        cart.setUser(user);
        cart.setStatus(openStatus);

        cart = cartRepository.save(cart);
        return new CartDto(cart);
    }


    public CartDto updateById(Long id, CartDto dto) {
        Cart cart = cartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (dto.getStatus() != null) {
            cart.setStatus(paramRepository.findByTypeAndCode("CART_STATUS", dto.getStatus())
                    .orElseThrow(() -> new RuntimeException("Invalid status")));
        }

        if (dto.getItems() != null) {
            for (CartItemDto itemDto : dto.getItems()) {
                CartItem item = cart.getItems().stream()
                        .filter(i -> i.getId().equals(itemDto.getId()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Item not found"));

                item.setQuantity(itemDto.getQuantity());
                // Có thể update các field khác nếu muốn
            }
        }
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

        // user
        entity.setUser(userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found")));

        // status
        if (dto.getStatus() == null) {
            throw new ValidationException("Cart status must not be null");
        }
        Param status = paramRepository.findByTypeAndCode("STATUS_CART", dto.getStatus())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid status: " + dto.getStatus()));
        entity.setStatus(status);

        return entity;
    }
}
