package org.example.backend.controller.inventory;

import org.example.backend.dto.Response;
import org.example.backend.dto.inventory.InventoryDto;
import org.example.backend.service.inventory.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventories")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAll() {
        List<InventoryDto> list = inventoryService.findAll();
        return ResponseEntity.ok(new Response<>("success", list, "Inventories retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        InventoryDto dto = inventoryService.getById(id);
        return ResponseEntity.ok(new Response<>("success", dto, "Inventory retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody InventoryDto dto) {
        InventoryDto saved = inventoryService.save(dto);
        return ResponseEntity.ok(new Response<>("success", saved, "Inventory created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody InventoryDto dto) {
        InventoryDto updated = inventoryService.updateById(id, dto);
        return ResponseEntity.ok(new Response<>("success", updated, "Inventory updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        inventoryService.deleteById(id);
        return ResponseEntity.ok(new Response<>("success", null, "Inventory deleted successfully"));
    }
}
