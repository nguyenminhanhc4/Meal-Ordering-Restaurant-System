package org.example.backend.controller;

import org.example.backend.dto.UserDTO;
import org.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO userDTO) {
        try {
            UserDTO registeredUser = userService.register(userDTO);
            return ResponseEntity.ok(new Response<>("success", registeredUser, "User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new Response<>("error", null, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO userDTO) {
        try {
            String token = userService.login(userDTO.getEmail(), userDTO.getPassword());
            return ResponseEntity.ok(new Response<>("success", token, "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new Response<>("error", null, e.getMessage()));
        }
    }

    private static class Response<T> {
        private String status;
        private T data;
        private String message;

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
