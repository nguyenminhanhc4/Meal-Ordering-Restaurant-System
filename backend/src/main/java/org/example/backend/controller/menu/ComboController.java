package org.example.backend.controller.menu;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.Response;
import org.example.backend.dto.menu.ComboDto;
import org.example.backend.dto.menu.ComboRequest;
import org.example.backend.service.menu.ComboService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/combos")
@RequiredArgsConstructor
public class ComboController {

    private final ComboService comboService;

    @GetMapping
    public ResponseEntity<?> getAllCombos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long statusId,
            @RequestParam(defaultValue = "name-asc") String sort
            ) {
        Page<ComboDto> combos = comboService.findAll(page, size, search, categoryId, statusId, sort);
        return ResponseEntity.ok(new Response<>("success", combos, "Combos retrieved successfully"));
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
