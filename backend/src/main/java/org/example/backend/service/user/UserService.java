package org.example.backend.service.user;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.user.UserDTO;
import org.example.backend.entity.param.Param;
import org.example.backend.entity.user.User;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.param.ParamRepository;
import org.example.backend.repository.user.UserRepository;
import org.example.backend.util.JwtUtil;
import org.example.backend.validator.UserValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
        "image/jpeg", "image/png", "image/gif"
    );

    private final UserRepository userRepository;

    private final ParamRepository paramRepository;

    private final PasswordEncoder passwordEncoder;

    private final MessageSource messageSource;

    private final JwtUtil jwtUtil;

    private final Cloudinary cloudinary;

    private final Map<String, ResetToken> resetTokens = new HashMap<>();

    private String getMessage(String code, Object[] args, Locale locale) {
        return messageSource.getMessage(code, args, locale);
    }

    private String getMessage(String code, Locale locale) {
        return messageSource.getMessage(code, null, locale);
    }

    private boolean isValidImageType(String contentType) {
        return contentType != null && ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase());
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null) {
            return UUID.randomUUID().toString();
        }
        // Remove any path components and special characters
        fileName = fileName.replaceAll("[^a-zA-Z0-9.-]", "_");
        return fileName.length() > 50 ? fileName.substring(0, 50) : fileName;
    }

    private void validateUserDTO(UserDTO userDTO, boolean isNewUser) {
        if (userDTO == null) {
            throw new IllegalArgumentException("User data cannot be null");
        }

        // Validate required fields
        if (userDTO.getName() == null || userDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }

        if (userDTO.getEmail() == null || userDTO.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (!isValidEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Invalid email format");
        }

        if (isNewUser && (userDTO.getPassword() == null || userDTO.getPassword().trim().isEmpty())) {
            throw new IllegalArgumentException("Password is required for new users");
        }

        if (userDTO.getRoleId() == null) {
            throw new IllegalArgumentException("Role is required");
        }

        if (userDTO.getStatusId() == null) {
            throw new IllegalArgumentException("Status is required");
        }

        // Validate phone if provided
        if (userDTO.getPhone() != null && !userDTO.getPhone().trim().isEmpty() 
            && !isValidPhone(userDTO.getPhone())) {
            throw new IllegalArgumentException("Invalid phone number format");
        }
    }

    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        return email.matches(emailRegex);
    }

    private boolean isValidPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return false;
        }
        String phoneRegex = "^[0-9]{10,11}$";
        return phone.matches(phoneRegex);
    }

    private Param validateAndGetParam(Long id, String type, String errorPrefix) {
        if (id == null) {
            throw new IllegalArgumentException(errorPrefix + " ID cannot be null");
        }
        Param param = paramRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(errorPrefix + " not found with ID: " + id));
        if (!type.equals(param.getType())) {
            throw new IllegalArgumentException("Invalid " + errorPrefix.toLowerCase() + " parameter: " + id);
        }
        return param;
    }

    public String uploadAvatar(MultipartFile file) throws IOException {
        // Validate file
        if (file == null) {
            throw new IllegalArgumentException("File cannot be null");
        }
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        if (!isValidImageType(file.getContentType())) {
            throw new IllegalArgumentException("Invalid file type. Only JPG, PNG and GIF are allowed");
        }
        if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
            throw new IllegalArgumentException("File size cannot exceed 5MB");
        }

        try {
            // Log file info
            System.out.printf("Processing file upload: name=%s, size=%d, type=%s%n", 
                file.getOriginalFilename(), file.getSize(), file.getContentType());

            // Generate unique filename
            String fileName = UUID.randomUUID().toString() + "-" + 
                sanitizeFileName(file.getOriginalFilename());
            
            // Prepare Cloudinary parameters
            Map<String, Object> params = ObjectUtils.asMap(
                "folder", "users",
                "public_id", fileName,
                "overwrite", true,
                "resource_type", "image"
            );
            
            System.out.println("Initiating Cloudinary upload with params: " + params);
            
            // Upload to Cloudinary
            Map<String, String> uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
            
            // Validate and extract URL
            if (!uploadResult.containsKey("secure_url")) {
                throw new RuntimeException("Upload failed: No URL in response");
            }
            
            String url = uploadResult.get("secure_url");
            System.out.println("Upload successful: " + url);
            
            return url;
            
        } catch (Exception e) {
            System.err.println("Upload failed: " + e.getMessage());
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    // Update user avatar
    @Transactional
    public UserDTO updateUserAvatar(String publicId, MultipartFile file) throws IOException {
        if (publicId == null || publicId.trim().isEmpty()) {
            throw new IllegalArgumentException("Public ID cannot be null or empty");
        }

        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with publicId: " + publicId));

        // Delete old avatar if exists (TODO: implement Cloudinary deletion)
        String oldAvatarUrl = user.getAvatarUrl();
        if (oldAvatarUrl != null && !oldAvatarUrl.isEmpty()) {
            System.out.println("Previous avatar URL: " + oldAvatarUrl);
        }

        // Upload new avatar
        String url = uploadAvatar(file);
        if (url == null || url.trim().isEmpty()) {
            throw new RuntimeException("Failed to get URL for uploaded avatar");
        }

        user.setAvatarUrl(url);
        userRepository.save(user);

        System.out.println("Avatar updated successfully for user: " + publicId);
        return convertToDTO(user);
    }

    @Transactional
    public UserDTO createUser(UserDTO userDTO) {
        // Validate basic fields
        validateUserDTO(userDTO, true);

        // Check if email already exists
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new IllegalStateException("Email already exists: " + userDTO.getEmail());
        }

        try {
            User user = new User();
            user.setPublicId(UUID.randomUUID().toString());
            user.setName(userDTO.getName().trim());
            user.setEmail(userDTO.getEmail().trim().toLowerCase());
            user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));
            
            // Set phone if provided
            if (userDTO.getPhone() != null && !userDTO.getPhone().trim().isEmpty()) {
                user.setPhone(userDTO.getPhone().trim());
            }
            
            // Handle avatar URL
            if (userDTO.getAvatarUrl() != null && !userDTO.getAvatarUrl().trim().isEmpty()) {
                logger.info("Setting avatar URL for new user: {}", userDTO.getAvatarUrl());
                user.setAvatarUrl(userDTO.getAvatarUrl().trim());
            } else {
                logger.debug("No avatar URL provided for new user");
            }

            // Set Role
            Param role = validateAndGetParam(userDTO.getRoleId(), "ROLE", "Role");
            user.setRole(role);

            // Set Status
            Param status = validateAndGetParam(userDTO.getStatusId(), "STATUS", "Status");
            user.setStatus(status);

            // Set Gender if provided
            if (userDTO.getGender() != null && !userDTO.getGender().trim().isEmpty()) {
                Param gender = paramRepository.findByTypeAndCode("GENDER", userDTO.getGender())
                    .orElseThrow(() -> new ResourceNotFoundException("Gender not found: " + userDTO.getGender()));
                user.setGender(gender);
            }

            // Save user
            userRepository.save(user);
            logger.info("Created new user with email: {}", user.getEmail());

            return convertToDTO(user);
        } catch (Exception e) {
            logger.error("Error creating user: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create user: " + e.getMessage(), e);
        }
    }

    public UserDTO register(UserDTO userDTO) {
        // Validate
        UserValidator.validateRegister(userDTO, userRepository, paramRepository);

        User user = new User();
        user.setPublicId(UUID.randomUUID().toString());
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));
        user.setAvatarUrl(userDTO.getAvatarUrl());

        // Role CUSTOMER
        Param role = paramRepository.findByTypeAndCode("ROLE", "CUSTOMER").get();
        user.setRole(role);

        // Status ACTIVE
        Param status = paramRepository.findByTypeAndCode("STATUS", "ACTIVE").get();
        user.setStatus(status);

        if (userDTO.getGender() != null) {
            Param gender = paramRepository.findByTypeAndCode("GENDER", userDTO.getGender()).get();
            user.setGender(gender);
        }

        userRepository.save(user);
        return convertToDTO(user);
    }

    public String login(String email, String password) {
        UserValidator.validateForLogin(email, password);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        return jwtUtil.generateToken(user.getEmail(), user.getRole().getCode(), user.getName(), user.getPublicId());
    }

    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword,Locale locale) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(getMessage("user.error.notFound", new Object[]{email}, locale)));

        // ✅ 1. Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException(getMessage("password.error.currentIncorrect", null, locale));
        }

        // ✅ 2. Không cho phép trùng mật khẩu cũ
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new RuntimeException(getMessage("password.error.sameAsOld", null, locale));
        }

        // ✅ 3. Kiểm tra độ mạnh mật khẩu
        validatePasswordStrength(newPassword, locale);

        // ✅ 4. Cập nhật mật khẩu mới (hash)
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private void validatePasswordStrength(String password, Locale locale) {
        if (password.length() < 8) {
            throw new RuntimeException(getMessage("password.error.minLength", new Object[]{8}, locale));
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new RuntimeException(getMessage("password.error.uppercaseRequired", null, locale));
        }
        if (!password.matches(".*[a-z].*")) {
            throw new RuntimeException(getMessage("password.error.lowercaseRequired", null, locale));
        }
        if (!password.matches(".*\\d.*")) {
            throw new RuntimeException(getMessage("password.error.numberRequired", null, locale));
        }
        if (!password.matches(".*[!@#$%^&*()_+\\-={}\\[\\]|;:'\",.<>/?].*")) {
            throw new RuntimeException(getMessage("password.error.specialCharRequired", null, locale));
        }
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToDTO(user);
    }

    public UserDTO getUserByPublicId(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with publicId: " + publicId));
        return convertToDTO(user);
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return convertToDTO(user);
    }

    public UserDTO createStaff(UserDTO userDTO) {
        // Validate
        UserValidator.validateCreateStaff(userDTO, userRepository, paramRepository);

        User user = new User();
        user.setPublicId(UUID.randomUUID().toString());
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));
        user.setAvatarUrl(userDTO.getAvatarUrl());

        Param role = paramRepository.findByTypeAndCode("ROLE", "STAFF").get();
        user.setRole(role);

        Param status = paramRepository.findByTypeAndCode("STATUS", "ACTIVE").get();
        user.setStatus(status);

        if (userDTO.getGender() != null) {
            Param gender = paramRepository.findByTypeAndCode("GENDER", userDTO.getGender()).get();
            user.setGender(gender);
        }

        userRepository.save(user);
        return convertToDTO(user);
    }

    public List<UserDTO> getAllStaff() {
        return userRepository.findByRoleCode("STAFF")
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Page<UserDTO> getAllUsers(String keyword, String roleIdStr, PageRequest pageRequest) {
        logger.info("Getting users with pageRequest: {}, keyword: {}, roleId: {}", pageRequest, keyword, roleIdStr);

        Page<User> userPage;
        Long roleId = null;

        // Xử lý roleId từ String
        if (roleIdStr != null && !roleIdStr.trim().isEmpty()) {
            try {
                roleId = Long.parseLong(roleIdStr.trim());
            } catch (NumberFormatException e) {
                logger.warn("Invalid roleId format: {}", roleIdStr);
            }
        }

        // Nếu có keyword HOẶC có roleId, ta sử dụng phương thức tìm kiếm mới
        if ((keyword != null && !keyword.trim().isEmpty()) || roleId != null) {
            String finalKeyword = keyword != null ? keyword.trim() : ""; // Đảm bảo keyword không null khi truyền vào
            Long finalRoleId = roleId != null ? roleId : 0L; // Truyền 0 hoặc null, tùy thuộc vào truy vấn

            // Gọi phương thức repository mới
            userPage = userRepository.findByKeywordAndRole(finalKeyword, finalRoleId, pageRequest);

            logger.info("Found {} users matching filter, total {} users",
                    userPage.getNumberOfElements(), userPage.getTotalElements());

        } else {
            // Use the default findAll method if no filter/search is provided
            userPage = userRepository.findAll(pageRequest);
            logger.info("Found {} users (no filter), total {} users",
                    userPage.getNumberOfElements(), userPage.getTotalElements());
        }

        return userPage.map(this::convertToDTO);
    }

    public List<UserDTO> getAllCustomer() {
        return userRepository.findByRoleCode("CUSTOMER")
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO updateUserByPublicId(String publicId, UserDTO userDTO) {
        if (publicId == null || publicId.trim().isEmpty()) {
            throw new IllegalArgumentException("Public ID cannot be null or empty");
        }

        try {
            // Validate update data
            validateUserDTO(userDTO, false);

            User user = userRepository.findByPublicId(publicId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with publicId: " + publicId));

            // Check if email is being changed and if it's already taken
            if (!user.getEmail().equals(userDTO.getEmail())) {
                if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
                    throw new IllegalStateException("Email already exists: " + userDTO.getEmail());
                }
            }

            // Update basic info
            user.setName(userDTO.getName().trim());
            user.setEmail(userDTO.getEmail().trim().toLowerCase());
            
            // Update phone if provided
            if (userDTO.getPhone() != null) {
                if (!userDTO.getPhone().trim().isEmpty() && !isValidPhone(userDTO.getPhone())) {
                    throw new IllegalArgumentException("Invalid phone number format");
                }
                user.setPhone(userDTO.getPhone().trim());
            }

            // Update avatar URL if provided
            if (userDTO.getAvatarUrl() != null) {
                logger.info("Updating avatar URL for user {}: {}", publicId, userDTO.getAvatarUrl());
                user.setAvatarUrl(userDTO.getAvatarUrl().trim());
            }

            // Update role if provided
            if (userDTO.getRoleId() != null) {
                Param role = validateAndGetParam(userDTO.getRoleId(), "ROLE", "Role");
                user.setRole(role);
            }

            // Update status if provided
            if (userDTO.getStatusId() != null) {
                Param status = validateAndGetParam(userDTO.getStatusId(), "STATUS", "Status");
                user.setStatus(status);
            }

            // Update gender if provided
            if (userDTO.getGender() != null) {
                if (!userDTO.getGender().trim().isEmpty()) {
                    Param gender = paramRepository.findByTypeAndCode("GENDER", userDTO.getGender())
                        .orElseThrow(() -> new ResourceNotFoundException("Gender not found: " + userDTO.getGender()));
                    user.setGender(gender);
                } else {
                    user.setGender(null);
                }
            }

            // Save and return
            userRepository.save(user);
            logger.info("Updated user: {}", publicId);
            
            return convertToDTO(user);
        } catch (Exception e) {
            logger.error("Error updating user {}: {}", publicId, e.getMessage(), e);
            throw new RuntimeException("Failed to update user: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteUserByPublicId(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with publicId: " + publicId));
        userRepository.delete(user);
    }

    public UserDTO updateUserByEmail(String email, UserDTO userDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Validate update
        UserValidator.validateUpdate(userDTO, paramRepository);

        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());
        user.setAddress(userDTO.getAddress());

        if (userDTO.getGender() != null) {
            Param gender = paramRepository.findByTypeAndCode("GENDER", userDTO.getGender()).get();
            user.setGender(gender);
        }

        userRepository.save(user);
        return convertToDTO(user);
    }

    public String generateResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        String token = UUID.randomUUID().toString();
        resetTokens.put(token, new ResetToken(email, LocalDateTime.now().plusMinutes(10)));
        return token;
    }

    public void resetPassword(String token, String newPassword) {
        ResetToken resetToken = resetTokens.get(token);
        if (resetToken == null || resetToken.getExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token không hợp lệ hoặc đã hết hạn");
        }

        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetTokens.remove(token); // Xóa token sau khi dùng
    }

    private static class ResetToken {
        private String email;
        private LocalDateTime expiry;
        public ResetToken(String email, LocalDateTime expiry) {
            this.email = email;
            this.expiry = expiry;
        }
        public String getEmail() { return email; }
        public LocalDateTime getExpiry() { return expiry; }
    }

    private UserDTO convertToDTO(User user) {
        if (user == null) {
            return null;
        }

        UserDTO dto = new UserDTO();
        
        // Set basic info
        dto.setId(user.getId());
        dto.setPublicId(user.getPublicId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        
        // Set optional fields only if they exist
        Optional.ofNullable(user.getPhone()).ifPresent(dto::setPhone);
        Optional.ofNullable(user.getAddress()).ifPresent(dto::setAddress);
        Optional.ofNullable(user.getAvatarUrl()).ifPresent(dto::setAvatarUrl);
        
        // Set role and status IDs
        Optional.ofNullable(user.getRole())
            .ifPresent(role -> dto.setRoleId(role.getId()));
            
        Optional.ofNullable(user.getStatus())
            .ifPresent(status -> dto.setStatusId(status.getId()));
            
        // Set gender if exists
        Optional.ofNullable(user.getGender())
            .ifPresent(gender -> dto.setGender(gender.getName()));
        
        return dto;
    }
}
