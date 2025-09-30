package org.example.backend.controller.order;

import org.example.backend.dto.cart.CartDto;
import org.example.backend.dto.order.OrderDto;
import org.example.backend.dto.Response;
import org.example.backend.service.order.OrderService;
import org.example.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAll() {
        List<OrderDto> orders = orderService.findAll();
        return ResponseEntity.ok(new Response<>("success", orders, "Orders retrieved successfully"));
    }

    @PostMapping("/checkout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> checkout(@RequestBody CartDto cart) {
        OrderDto order = orderService.checkoutCart(cart);
        return ResponseEntity.ok(new Response<>("success", order, "Order created successfully"));
    }


    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentUserOrders(@CookieValue("token") String token) {
        String publicId = jwtUtil.getPublicIdFromToken(token);
        List<OrderDto> orders = orderService.findAllOrderByUserPublicId(publicId);
        return ResponseEntity.ok(new Response<>("success", orders, "Orders retrieved successfully"));
    }

    @GetMapping("/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getByPublicId(@PathVariable String publicId) {
        OrderDto order = orderService.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return ResponseEntity.ok(new Response<>("success", order, "Order retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@RequestBody OrderDto dto) {
        OrderDto saved = orderService.save(dto);
        return ResponseEntity.ok(new Response<>("success", saved, "Order created successfully"));
    }

    @PutMapping("/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(@PathVariable String publicId, @RequestBody OrderDto dto) {
        OrderDto updated = orderService.updateByPublicId(publicId, dto);
        return ResponseEntity.ok(new Response<>("success", updated, "Order updated successfully"));
    }

    @DeleteMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String publicId) {
        orderService.deleteByPublicId(publicId);
        return ResponseEntity.ok(new Response<>("success", null, "Order deleted successfully"));
    }
}
