package org.example.backend.controller;

import org.example.backend.dto.OrderDto;
import org.example.backend.dto.Response;
import org.example.backend.service.OrderService;
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

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAll() {
        List<OrderDto> orders = orderService.findAll();
        return ResponseEntity.ok(new Response<>("success", orders, "Orders retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        OrderDto order = orderService.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        return ResponseEntity.ok(new Response<>("success", order, "Order retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@RequestBody OrderDto dto) {
        OrderDto saved = orderService.save(dto);
        return ResponseEntity.ok(new Response<>("success", saved, "Order created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody OrderDto dto) {
        OrderDto updated = orderService.updateById(id, dto);
        return ResponseEntity.ok(new Response<>("success", updated, "Order updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        orderService.deleteById(id);
        return ResponseEntity.ok(new Response<>("success", null, "Order deleted successfully"));
    }
}
