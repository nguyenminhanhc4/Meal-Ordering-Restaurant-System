package org.example.backend.controller.menu;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.Response;
import org.example.backend.dto.menu.ComboDto;
import org.example.backend.service.menu.ComboService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/combos")
@RequiredArgsConstructor
public class ComboController {

    private final ComboService comboService;

    // =====================================
    // PUBLIC ENDPOINTS
    // =====================================

    /**
     * Get all combos (public)
     */
    @GetMapping
    public ResponseEntity<?> getAllCombos() {
        List<ComboDto> combos = comboService.findAll();
        return ResponseEntity.ok(
                new Response<>("success", combos, "Combos retrieved successfully")
        );
    }

    /**
     * Get combo by ID (public)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getComboById(@PathVariable Long id) {
        ComboDto combo = comboService.getById(id);
        return ResponseEntity.ok(
                new Response<>("success", combo, "Combo retrieved successfully")
        );
    }

    // =====================================
    // ADMIN ENDPOINTS
    // =====================================

    /**
     * Create a new combo
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCombo(@RequestBody ComboDto dto) {
        try {
            ComboDto saved = comboService.save(dto);
            return ResponseEntity.ok(
                    new Response<>("success", saved, "Combo created successfully")
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new Response<>("error", null, e.getMessage()));
        }
    }

    /**
     * Update an existing combo
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCombo(@PathVariable Long id, @RequestBody ComboDto dto) {
        try {
            ComboDto updated = comboService.updateById(id, dto);
            return ResponseEntity.ok(
                    new Response<>("success", updated, "Combo updated successfully")
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new Response<>("error", null, e.getMessage()));
        }
    }

    /**
     * Delete a combo
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCombo(@PathVariable Long id) {
        try {
            comboService.deleteById(id);
            return ResponseEntity.ok(
                    new Response<>("success", null, "Combo deleted successfully")
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new Response<>("error", null, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new Response<>("error", null, "Internal server error: " + e.getMessage()));
        }
    }

    // =====================================
    // FUTURE EXTENSIONS (OPTIONAL)
    // =====================================

    /**
     * Filter combos by type or availability (optional future endpoint)
     * Example: /api/v1/combos/filter?typeId=109&availabilityId=105
     */
    @GetMapping("/filter")
    public ResponseEntity<?> filterCombos(
            @RequestParam(required = false) Long typeId,
            @RequestParam(required = false) Long availabilityId,
            @RequestParam(required = false) Long peopleId
    ) {
        // For now, just return all; logic can be added in ComboService later
        List<ComboDto> combos = comboService.findAll();
        return ResponseEntity.ok(
                new Response<>("success", combos, "Combo filtering not yet implemented")
        );
    }
}
