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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody UserDTO userDTO) {
        try {
            System.out.println("Creating user with data:");
            System.out.println("Name: " + userDTO.getName());
            System.out.println("Email: " + userDTO.getEmail());
            System.out.println("Avatar URL: " + userDTO.getAvatarUrl());
            
            UserDTO createdUser = userService.createUser(userDTO);
            return ResponseEntity.ok(new Response<>("success", createdUser, "User created successfully"));
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return ResponseEntity.internalServerError()
                .body(new Response<>("error", null, "Failed to create user: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String[] sort,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String roleId
    ) {
        try {
            String sortField = sort[0];
            Sort.Direction direction = sort.length > 1 && sort[1].equalsIgnoreCase("desc") ?
                    Sort.Direction.DESC : Sort.Direction.ASC;

            PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortField));

            Page<UserDTO> pageResult = userService.getAllUsers(keyword, roleId, pageRequest);

            Map<String, Object> response = Map.of(
                    "data", pageResult.getContent(),
                    "metadata", Map.of(
                            "total", pageResult.getTotalElements(),
                            "totalPages", pageResult.getTotalPages(),
                            "currentPage", pageResult.getNumber(),
                            "size", pageResult.getSize(),
                            "hasNext", pageResult.hasNext(),
                            "hasPrevious", pageResult.hasPrevious()
                    )
            );

            return ResponseEntity.ok(new Response<>("success", response, "Users list retrieved successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new Response<>("error", null, "Failed to retrieve users: " + e.getMessage()));
        }
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

    // Upload avatar
    @PostMapping("/{publicId}/avatar")
    public ResponseEntity<UserDTO> uploadAvatar(
            @PathVariable String publicId,
            @RequestParam("avatar") MultipartFile avatar) throws IOException {
        UserDTO updatedUser = userService.updateUserAvatar(publicId, avatar);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam(value = "avatar", required = true) MultipartFile avatar) {
        System.out.println("Received upload request");
        try {
            if (avatar == null || avatar.isEmpty()) {
                System.out.println("No file received or empty file");
                return ResponseEntity.badRequest()
                    .body(new Response<>("error", null, "No file was uploaded"));
            }

            System.out.println("Processing file: " + avatar.getOriginalFilename());
            System.out.println("File size: " + avatar.getSize());
            System.out.println("Content type: " + avatar.getContentType());

            String url = userService.uploadAvatar(avatar);
            if (url == null) {
                System.out.println("Upload failed - null URL returned");
                return ResponseEntity.badRequest()
                    .body(new Response<>("error", null, "Failed to upload file"));
            }

            System.out.println("Upload successful - URL: " + url);
            return ResponseEntity.ok(new Response<>("success", Map.of("url", url), "File uploaded successfully"));
        } catch (Exception e) {
            System.err.println("Error during upload:");
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(new Response<>("error", null, "Failed to upload file: " + e.getMessage()));
        }
    }
}