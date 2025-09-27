package org.example.backend.controller.user;

import org.example.backend.dto.Response;
import org.example.backend.dto.user.UserDTO;
import org.example.backend.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllCustomer() {
        List<UserDTO> customer = userService.getAllCustomer();
        return ResponseEntity.ok(new Response<>("success", customer, "Customer list retrieved successfully"));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); // Lấy email từ SecurityContext (được gán bởi JwtAuthenticationFilter)
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(new Response<>("success", user, "User retrieved successfully"));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateCurrentUser(@RequestBody UserDTO userDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        UserDTO updatedUser = userService.updateUserByEmail(email, userDTO);
        return ResponseEntity.ok(new Response<>("success", updatedUser, "User updated successfully"));
    }

    @GetMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserByPublicId(@PathVariable String publicId) {
        UserDTO user = userService.getUserByPublicId(publicId);
        return ResponseEntity.ok(new Response<>("success", user, "User retrieved successfully"));
    }

    @PutMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable String publicId, @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUserByPublicId(publicId, userDTO);
        return ResponseEntity.ok(new Response<>("success", updatedUser, "User updated successfully"));
    }

    @DeleteMapping("/{publicId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable String publicId) {
        userService.deleteUserByPublicId(publicId);
        return ResponseEntity.ok(new Response<>("success", null, "User deleted successfully"));
    }
}