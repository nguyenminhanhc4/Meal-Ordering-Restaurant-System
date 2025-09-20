package org.example.backend.controller;

import org.example.backend.dto.Response;
import org.example.backend.dto.UserDTO;
import org.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/staff")
public class StaffController {

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> createStaff(@RequestBody UserDTO userDTO) {
        UserDTO createdStaff = userService.createStaff(userDTO);
        return ResponseEntity.ok(new Response<>("success", createdStaff, "Staff created successfully"));
    }

    @GetMapping("/{publicId}")
    public ResponseEntity<?> getStaffByPublicId(@PathVariable String publicId) {
        UserDTO userDTO = userService.getUserByPublicId(publicId);
        return ResponseEntity.ok(new Response<>("success", userDTO, "Staff retrieved successfully"));
    }

    @GetMapping
    public ResponseEntity<?> getAllStaff() {
        List<UserDTO> staff = userService.getAllStaff();
        return ResponseEntity.ok(new Response<>("success", staff, "Staff list retrieved successfully"));
    }

    @PutMapping("/{publicId}")
    public ResponseEntity<?> updateStaff(@PathVariable String publicId, @RequestBody UserDTO userDTO) {
        UserDTO updatedStaff = userService.updateUserByPublicId(publicId, userDTO);
        return ResponseEntity.ok(new Response<>("success", updatedStaff, "Staff updated successfully"));
    }

    @DeleteMapping("/{publicId}")
    public ResponseEntity<?> deleteStaff(@PathVariable String publicId) {
        userService.deleteUserByPublicId(publicId);
        return ResponseEntity.ok(new Response<>("success", null, "Staff deleted successfully"));
    }
}