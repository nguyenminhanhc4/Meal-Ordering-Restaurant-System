package org.example.backend.controller;

import org.example.backend.dto.UserDTO;
import org.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentUser() {
        // Giả sử bạn lấy userId từ JWT (thông qua SecurityContext)
        // Đây là ví dụ, bạn cần implement logic lấy userId từ token
        Long userId = 1L; // Thay bằng logic thực tế
        UserDTO user = userService.getUserById(userId);
        return ResponseEntity.ok(new Response<>("success", user, "User retrieved successfully"));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateCurrentUser(@RequestBody UserDTO userDTO) {
        // Giả sử bạn lấy userId từ JWT
        Long userId = 1L; // Thay bằng logic thực tế
        UserDTO updatedUser = userService.updateUser(userId, userDTO);
        return ResponseEntity.ok(new Response<>("success", updatedUser, "User updated successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(new Response<>("success", user, "User retrieved successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(id, userDTO);
        return ResponseEntity.ok(new Response<>("success", updatedUser, "User updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new Response<>("success", null, "User deleted successfully"));
    }

    private static class Response<T> {
        private final String status;
        private final T data;
        private final String message;

        public Response(String status, T data, String message) {
            this.status = status;
            this.data = data;
            this.message = message;
        }

        public String getStatus() { return status; }
        public T getData() { return data; }
        public String getMessage() { return message; }
    }
}
