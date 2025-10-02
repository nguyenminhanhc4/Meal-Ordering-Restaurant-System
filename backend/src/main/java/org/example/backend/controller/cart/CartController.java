package org.example.backend.controller.cart;

import com.cloudinary.api.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.example.backend.dto.cart.CartDto;
import org.example.backend.dto.Response;
import org.example.backend.service.cart.CartService;
import org.example.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/carts")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAll() {
        List<CartDto> carts = cartService.findAll();
        return ResponseEntity.ok(new Response<>("success", carts, "Carts retrieved successfully"));
    }

    @GetMapping("/current")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentCart(@CookieValue("token") String token) {
        String publicId = jwtUtil.getPublicIdFromToken(token);
        CartDto currentCart = cartService.getCurrentCart(publicId);
        return ResponseEntity.ok(new Response<>("success", currentCart, "Current cart fetched successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        CartDto cart = cartService.findById(id).orElseThrow(() -> new RuntimeException("Cart not found"));
        return ResponseEntity.ok(new Response<>("success", cart, "Cart retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@RequestBody CartDto dto) {
        CartDto saved = cartService.save(dto);
        return ResponseEntity.ok(new Response<>("success", saved, "Cart created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CartDto dto) {
        CartDto updated = cartService.updateById(id, dto);
        return ResponseEntity.ok(new Response<>("success", updated, "Cart updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        cartService.deleteById(id);
        return ResponseEntity.ok(new Response<>("success", null, "Cart deleted successfully"));
    }
}
