package org.example.backend.controller.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.http.auth.InvalidCredentialsException;
import org.example.backend.dto.Response;
import org.example.backend.dto.user.UserDTO;
import org.example.backend.repository.user.UserRepository;
import org.example.backend.service.user.EmailService;
import org.example.backend.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.naming.AuthenticationException;
import java.util.Locale;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserService userService;

    private final EmailService emailService;

    private final UserRepository userRepository;

    private final MessageSource messageSource;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO userDTO, HttpServletRequest request) {
        Locale locale = request.getLocale();
        try {
            // ===== Validate name =====
            String name = userDTO.getName() != null ? userDTO.getName().trim() : "";
            if (name.isEmpty()) {
                String msg = messageSource.getMessage("register.error.requiredName", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }

            // ===== Validate email =====
            String email = userDTO.getEmail() != null ? userDTO.getEmail().trim() : "";
            if (email.isEmpty()) {
                String msg = messageSource.getMessage("register.error.requiredEmail", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }
            if (!email.matches("^[^\\s@]+@[^\s@]+\\.[^\\s@]+$")) {
                String msg = messageSource.getMessage("register.error.invalidEmailFormat", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }
            if (userRepository.existsByEmail(email)) {
                String msg = messageSource.getMessage("register.error.emailExists", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }

            // ===== Validate password =====
            String password = userDTO.getPassword() != null ? userDTO.getPassword().trim() : "";
            String confirmPassword = userDTO.getConfirmPassword() != null ? userDTO.getConfirmPassword().trim() : "";
            if (password.isEmpty()) {
                String msg = messageSource.getMessage("register.error.requiredPassword", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }
            if (password.length() < 8) {
                String msg = messageSource.getMessage("register.error.shortPassword", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }
            if (!password.matches(".*[A-Z].*")) {
                String msg = messageSource.getMessage("register.error.uppercaseRequired", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }
            if (!password.matches(".*[0-9].*")) {
                String msg = messageSource.getMessage("register.error.numberRequired", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }
            if (!password.matches(".*[!@#$%^&*].*")) {
                String msg = messageSource.getMessage("register.error.specialCharRequired", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }

            if (!password.equals(confirmPassword)) {
                String msg = messageSource.getMessage("register.error.passwordMismatch", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }

            // ===== Validate gender =====
            String gender = userDTO.getGender() != null ? userDTO.getGender().trim() : "";
            if (!"MALE".equalsIgnoreCase(gender) && !"FEMALE".equalsIgnoreCase(gender)) {
                String msg = messageSource.getMessage("register.error.invalidGender", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }

            // ===== Register user =====
            UserDTO registeredUser = userService.register(userDTO);
            String successMsg = messageSource.getMessage("register.success", null, locale);
            return ResponseEntity.ok(new Response<>("success", registeredUser, successMsg));
        } catch (RuntimeException e) {
            String msg = messageSource.getMessage("register.error.failed", null, locale);
            return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO userDTO, HttpServletRequest request, HttpServletResponse response) {
        Locale locale = request.getLocale();
        try {
            // ===== Validate email =====
            String email = userDTO.getEmail() != null ? userDTO.getEmail().trim() : "";
            if (email.isEmpty()) {
                String msg = messageSource.getMessage("login.error.requiredEmail", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }
            if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                String msg = messageSource.getMessage("login.error.invalidEmailFormat", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }

            // ===== Validate password =====
            String password = userDTO.getPassword() != null ? userDTO.getPassword().trim() : "";
            if (password.isEmpty()) {
                String msg = messageSource.getMessage("login.error.requiredPassword", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }
            if (password.length() < 8) {
                String msg = messageSource.getMessage("login.error.shortPassword", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }
            if (!password.matches(".*[A-Z].*")) {
                String msg = messageSource.getMessage("login.error.uppercaseRequired", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }
            if (!password.matches(".*[0-9].*")) {
                String msg = messageSource.getMessage("login.error.numberRequired", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }
            if (!password.matches(".*[!@#$%^&*].*")) {
                String msg = messageSource.getMessage("login.error.specialCharRequired", null, locale);
                return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
            }

            // ===== Login =====
            String token = userService.login(email, password);

            // Set JWT vào HttpOnly cookie
            ResponseCookie cookie = ResponseCookie.from("token", token)
                    .httpOnly(true)
                    .secure(false) // true nếu chạy HTTPS
                    .path("/")
                    .maxAge(24 * 60 * 60) // 1 ngày
                    .sameSite("Lax")
                    .build();

            String successMsg = messageSource.getMessage("login.success", null, locale);
            response.addHeader("Set-Cookie", cookie.toString());
            return ResponseEntity.ok(new Response<>("success", token, successMsg));
        } catch (RuntimeException e) {
            String msg = messageSource.getMessage("login.error.invalidCredentials", null, locale);
            return ResponseEntity.badRequest().body(new Response<>("error", null, msg));
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

    // 🔹 Bước 1: Gửi link reset
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String token = userService.generateResetToken(email);

        // Tạo link reset
        String resetLink = "http://localhost:5173/reset-password?token=" + token;

        // Tạo nội dung email HTML
        String html = """
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <table align="center" width="100%%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <tr>
        <td style="text-align: center; padding: 20px;">
          <h2 style="color: #2E86C1; margin-bottom: 10px;">Đặt lại mật khẩu</h2>
          <p style="color: #555555; font-size: 16px; margin-bottom: 20px;">Nhấn vào nút dưới đây để đặt lại mật khẩu cho tài khoản của bạn:</p>
          <a href="%s" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đặt lại mật khẩu</a>
          <p style="color: #999999; font-size: 12px; margin-top: 30px;">Nếu bạn không yêu cầu việc đặt lại mật khẩu, hãy bỏ qua email này.</p>
        </td>
      </tr>
    </table>
  </body>
</html>
""".formatted(resetLink);


        // Gửi email
        emailService.sendHtmlEmail(email, "Đặt lại mật khẩu", html);

        return ResponseEntity.ok(Map.of("message", "Đã gửi email đặt lại mật khẩu nếu tài khoản tồn tại."));
    }


    // 🔹 Bước 2: Reset mật khẩu bằng token
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        userService.resetPassword(token, newPassword);

        return ResponseEntity.ok(Map.of("message", "Mật khẩu đã được đặt lại thành công!"));
    }
}
