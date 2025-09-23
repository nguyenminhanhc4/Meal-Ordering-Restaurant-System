package org.example.backend.service;

import org.example.backend.dto.UserDTO;
import org.example.backend.entity.Param;
import org.example.backend.entity.User;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.ParamRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.util.JwtUtil;
import org.example.backend.validator.UserValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParamRepository paramRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

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

        return jwtUtil.generateToken(user.getEmail(), user.getRole().getCode());
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

    public List<UserDTO> getAllCustomer() {
        return userRepository.findByRoleCode("CUSTOMER")
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO updateUserByPublicId(String publicId, UserDTO userDTO) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with publicId: " + publicId));

        // Validate update
        UserValidator.validateUpdate(userDTO, paramRepository);

        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setAvatarUrl(userDTO.getAvatarUrl());

        if (userDTO.getRoleId() != null) {
            Param role = paramRepository.findById(userDTO.getRoleId()).get();
            user.setRole(role);
        }
        if (userDTO.getGender() != null) {
            Param gender = paramRepository.findByTypeAndCode("GENDER", userDTO.getGender()).get();
            user.setGender(gender);
        }
        if (userDTO.getStatusId() != null) {
            Param status = paramRepository.findById(userDTO.getStatusId()).get();
            user.setStatus(status);
        }

        userRepository.save(user);
        return convertToDTO(user);
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
        user.setAvatarUrl(userDTO.getAvatarUrl());

        if (userDTO.getGender() != null) {
            Param gender = paramRepository.findByTypeAndCode("GENDER", userDTO.getGender()).get();
            user.setGender(gender);
        }

        userRepository.save(user);
        return convertToDTO(user);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setPublicId(user.getPublicId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setRoleId(user.getRole() != null ? user.getRole().getId() : null);
        dto.setStatusId(user.getStatus() != null ? user.getStatus().getId() : null);
        dto.setGender(user.getGender() != null ? user.getGender().getCode() : null);
        return dto;
    }
}
