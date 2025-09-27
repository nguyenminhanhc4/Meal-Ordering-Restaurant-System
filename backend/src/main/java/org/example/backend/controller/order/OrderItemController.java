package org.example.backend.controller.order;

import org.example.backend.dto.order.OrderItemDto;
import org.example.backend.dto.Response;
import org.example.backend.service.order.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/order-items")
public class OrderItemController {

    @Autowired
    private OrderItemService orderItemService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAll() {
        List<OrderItemDto> items = orderItemService.findAll();
        return ResponseEntity.ok(new Response<>("success", items, "Order items retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        OrderItemDto item = orderItemService.findById(id).orElseThrow(() -> new RuntimeException("OrderItem not found"));
        return ResponseEntity.ok(new Response<>("success", item, "Order item retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@RequestBody OrderItemDto dto) {
        OrderItemDto saved = orderItemService.save(dto);
        return ResponseEntity.ok(new Response<>("success", saved, "Order item created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody OrderItemDto dto) {
        OrderItemDto updated = orderItemService.updateById(id, dto);
        return ResponseEntity.ok(new Response<>("success", updated, "Order item updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        orderItemService.deleteById(id);
        return ResponseEntity.ok(new Response<>("success", null, "Order item deleted successfully"));
    }
}
