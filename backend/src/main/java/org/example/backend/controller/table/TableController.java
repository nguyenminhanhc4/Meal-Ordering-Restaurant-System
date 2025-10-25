package org.example.backend.controller.table;

import jakarta.validation.Valid;
import org.example.backend.dto.Response;
import org.example.backend.dto.table.TableDto;
import org.example.backend.service.table.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tables")
public class TableController {

    @Autowired
    private TableService tableService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllTables() {
        List<TableDto> tables = tableService.findAll();
        return ResponseEntity.ok(new Response<>("success", tables, "Tables retrieved successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTableById(@PathVariable Long id) {
        TableDto table = tableService.getById(id);
        return ResponseEntity.ok(new Response<>("success", table, "Table retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createTable(@Valid @RequestBody TableDto dto) {
        TableDto saved = tableService.save(dto);
        return ResponseEntity.ok(new Response<>("success", saved, "Table created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateTable(@PathVariable Long id, @RequestBody TableDto dto) {
        TableDto updated = tableService.updateById(id, dto);
        return ResponseEntity.ok(new Response<>("success", updated, "Table updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTable(@PathVariable Long id) {
        tableService.deleteById(id);
        return ResponseEntity.ok(new Response<>("success", null, "Table deleted successfully"));
    }
}
