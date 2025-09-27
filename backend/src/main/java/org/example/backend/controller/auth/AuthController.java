package org.example.backend.controller.auth;

import jakarta.servlet.http.HttpServletResponse;
import org.example.backend.dto.Response;
import org.example.backend.dto.user.UserDTO;
import org.example.backend.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
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
    public ResponseEntity<?> login(@RequestBody UserDTO userDTO, HttpServletResponse response) {
        try {
            String token = userService.login(userDTO.getEmail(), userDTO.getPassword());

            // Set JWT vào HttpOnly cookie
            ResponseCookie cookie = ResponseCookie.from("token", token)
                    .httpOnly(true)
                    .secure(false) // true nếu chạy HTTPS
                    .path("/")
                    .maxAge(24 * 60 * 60) // 1 ngày
                    .sameSite("Lax")
                    .build();

            response.addHeader("Set-Cookie", cookie.toString());
            return ResponseEntity.ok(new Response<>("success", token, "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new Response<>("error", null, e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Xóa cookie bằng cách set maxAge = 0
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(false) // true nếu chạy HTTPS
                .path("/")
                .maxAge(0) // xóa cookie ngay
                .sameSite("Lax")
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
        return ResponseEntity.ok(new Response<>("success", null, "Logout successful"));
    }

}
