package org.example.backend.validator;

import org.example.backend.dto.UserDTO;
import org.example.backend.entity.Param;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.ParamRepository;
import org.example.backend.repository.UserRepository;

import java.util.Optional;
import java.util.regex.Pattern;

public class UserValidator {

    private static final Pattern EMAIL_REGEX = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    public static void validateRegister(UserDTO userDTO, UserRepository userRepository, ParamRepository paramRepository) {
        validateCommon(userDTO, userRepository);

        // Validate role mặc định là CUSTOMER (tồn tại trong DB)
        paramRepository.findByTypeAndCode("ROLE", "CUSTOMER")
                .orElseThrow(() -> new ResourceNotFoundException("Role CUSTOMER not found"));

        // Validate status mặc định ACTIVE
        paramRepository.findByTypeAndCode("STATUS", "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("Status ACTIVE not found"));

        // Validate gender nếu có
        if (userDTO.getGender() != null) {
            paramRepository.findByTypeAndCode("GENDER", userDTO.getGender())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Gender not found with code: " + userDTO.getGender()));
        }

        if (userDTO.getPassword().length() < 8 || userDTO.getPassword().length() > 20) {
            throw new IllegalArgumentException("Password must be between 8 and 20 characters");
        }
    }

    public static void validateForLogin(String email, String password) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (password.length() < 8 || password.length() > 20) {
            throw new IllegalArgumentException("Password must be between 8 and 20 characters");
        }
    }


    public static void validateCreateStaff(UserDTO userDTO, UserRepository userRepository, ParamRepository paramRepository) {
        validateCommon(userDTO, userRepository);

        // Validate role STAFF
        paramRepository.findByTypeAndCode("ROLE", "STAFF")
                .orElseThrow(() -> new ResourceNotFoundException("Role STAFF not found"));

        // Validate status ACTIVE
        paramRepository.findByTypeAndCode("STATUS", "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("Status ACTIVE not found"));

        // Validate gender nếu có
        if (userDTO.getGender() != null) {
            paramRepository.findByTypeAndCode("GENDER", userDTO.getGender())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Gender not found with code: " + userDTO.getGender()));
        }
    }

    public static void validateUpdate(UserDTO userDTO, ParamRepository paramRepository) {
        if (userDTO.getRoleId() != null) {
            paramRepository.findById(userDTO.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + userDTO.getRoleId()));
        }
        if (userDTO.getStatusId() != null) {
            paramRepository.findById(userDTO.getStatusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Status not found with id: " + userDTO.getStatusId()));
        }
        if (userDTO.getGender() != null) {
            paramRepository.findByTypeAndCode("GENDER", userDTO.getGender())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Gender not found with code: " + userDTO.getGender()));
        }
    }

    private static void validateCommon(UserDTO userDTO, UserRepository userRepository) {
        if (userDTO.getName() == null || userDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }

        if (userDTO.getEmail() == null || !EMAIL_REGEX.matcher(userDTO.getEmail()).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }

        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (userDTO.getPassword() == null || userDTO.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        if (userDTO.getAvatarUrl() != null &&
                !userDTO.getAvatarUrl().startsWith("http")) {
            throw new IllegalArgumentException("Avatar URL must be a valid URL");
        }
    }
}
