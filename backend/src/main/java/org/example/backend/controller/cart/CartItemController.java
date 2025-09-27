package org.example.backend.controller.cart;

import org.example.backend.dto.cart.CartItemDto;
import org.example.backend.dto.Response;
import org.example.backend.service.cart.CartItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cart-items")
public class CartItemController {

    @Autowired
    private CartItemService cartItemService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAll() {
        List<CartItemDto> items = cartItemService.findAll();
        return ResponseEntity.ok(new Response<>("success", items, "Cart items retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        CartItemDto item = cartItemService.findById(id).orElseThrow(() -> new RuntimeException("CartItem not found"));
        return ResponseEntity.ok(new Response<>("success", item, "Cart item retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@RequestBody CartItemDto dto) {
        CartItemDto saved = cartItemService.save(dto);
        return ResponseEntity.ok(new Response<>("success", saved, "Cart item created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CartItemDto dto) {
        CartItemDto updated = cartItemService.updateById(id, dto);
        return ResponseEntity.ok(new Response<>("success", updated, "Cart item updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        cartItemService.deleteById(id);
        return ResponseEntity.ok(new Response<>("success", null, "Cart item deleted successfully"));
    }
}
