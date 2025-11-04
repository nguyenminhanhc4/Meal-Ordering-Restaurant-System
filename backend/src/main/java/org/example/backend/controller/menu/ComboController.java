package org.example.backend.controller.menu;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.menu.ComboDto;
import org.example.backend.dto.menu.ComboRequest;
import org.example.backend.service.menu.ComboService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/combos")
@RequiredArgsConstructor
public class ComboController {

    private final ComboService comboService;

    @GetMapping
    public ResponseEntity<List<ComboDto>> getAll() {
        return ResponseEntity.ok(comboService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComboDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(comboService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ComboDto> create(@RequestBody ComboRequest request) {
        return ResponseEntity.ok(comboService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComboDto> update(@PathVariable Long id, @RequestBody ComboRequest request) {
        return ResponseEntity.ok(comboService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        comboService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
