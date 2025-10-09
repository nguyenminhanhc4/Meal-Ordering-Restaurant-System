package org.example.backend.controller.param;

import org.example.backend.dto.Response;
import org.example.backend.dto.param.ParamDTO;
import org.example.backend.service.param.ParamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/params")
public class ParamController {

    @Autowired
    private ParamService paramService;

    @GetMapping
    public ResponseEntity<?> getParamsByType(@RequestParam String type) {
        try {
            List<ParamDTO> params = paramService.getAllParamsByType(type);
            System.out.println("Found " + params.size() + " params for type: " + type);
            params.forEach(p -> System.out.println("  - ID: " + p.getId() + ", Code: " + p.getCode() + ", Name: " + p.getName()));
            return ResponseEntity.ok(new Response<>("success", params, "Parameters retrieved successfully"));
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return ResponseEntity.internalServerError()
                .body(new Response<>("error", null, "Failed to retrieve parameters: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getParamById(@PathVariable Long id) {
        try {
            ParamDTO param = paramService.getParamById(id);
            return ResponseEntity.ok(new Response<>("success", param, "Parameter retrieved successfully"));
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return ResponseEntity.internalServerError()
                .body(new Response<>("error", null, "Failed to retrieve parameter: " + e.getMessage()));
        }
    }

    @GetMapping("/{type}/{code}")
    public ResponseEntity<?> getParamByTypeAndCode(
            @PathVariable String type,
            @PathVariable String code) {
        try {
            ParamDTO param = paramService.getParamByTypeAndCode(type, code);
            return ResponseEntity.ok(new Response<>("success", param, "Parameter retrieved successfully"));
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return ResponseEntity.internalServerError()
                .body(new Response<>("error", null, "Failed to retrieve parameter: " + e.getMessage()));
        }
    }
}