package org.example.backend.service;

import org.example.backend.dto.UserDTO;
import org.example.backend.entity.Param;
import org.example.backend.entity.User;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.ParamRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setPublicId(UUID.randomUUID().toString());
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));
        user.setAvatarUrl(userDTO.getAvatarUrl());

        // Set role (default: CUSTOMER)
        Param role = paramRepository.findByTypeAndCode("ROLE", "CUSTOMER")
                .orElseThrow(() -> new ResourceNotFoundException("Role CUSTOMER not found"));
        user.setRole(role);

        // Set status (default: ACTIVE)
        Param status = paramRepository.findByTypeAndCode("STATUS", "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("Status ACTIVE not found"));
        user.setStatus(status);

        // Set gender if provided
        if (userDTO.getGenderId() != null) {
            Param gender = paramRepository.findById(userDTO.getGenderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Gender not found with id: " + userDTO.getGenderId()));
            user.setGender(gender);
        }

        userRepository.save(user);
        return convertToDTO(user);
    }

    public String login(String email, String password) {
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

    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setAvatarUrl(userDTO.getAvatarUrl());

        if (userDTO.getRoleId() != null) {
            Param role = paramRepository.findById(userDTO.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + userDTO.getRoleId()));
            user.setRole(role);
        }

        if (userDTO.getGenderId() != null) {
            Param gender = paramRepository.findById(userDTO.getGenderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Gender not found with id: " + userDTO.getGenderId()));
            user.setGender(gender);
        }

        if (userDTO.getStatusId() != null) {
            Param status = paramRepository.findById(userDTO.getStatusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Status not found with id: " + userDTO.getStatusId()));
            user.setStatus(status);
        }

        userRepository.save(user);
        return convertToDTO(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }

    public UserDTO createStaff(UserDTO userDTO) {
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setPublicId(UUID.randomUUID().toString());
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));
        user.setAvatarUrl(userDTO.getAvatarUrl());

        Param role = paramRepository.findByTypeAndCode("ROLE", "STAFF")
                .orElseThrow(() -> new ResourceNotFoundException("Role STAFF not found"));
        user.setRole(role);

        Param status = paramRepository.findByTypeAndCode("STATUS", "ACTIVE")
                .orElseThrow(() -> new ResourceNotFoundException("Status ACTIVE not found"));
        user.setStatus(status);

        if (userDTO.getGenderId() != null) {
            Param gender = paramRepository.findById(userDTO.getGenderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Gender not found with id: " + userDTO.getGenderId()));
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

    public UserDTO updateUserByPublicId(String publicId, UserDTO userDTO) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with publicId: " + publicId));
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setAvatarUrl(userDTO.getAvatarUrl());

        if (userDTO.getRoleId() != null) {
            Param role = paramRepository.findById(userDTO.getRoleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + userDTO.getRoleId()));
            user.setRole(role);
        }

        if (userDTO.getGenderId() != null) {
            Param gender = paramRepository.findById(userDTO.getGenderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Gender not found with id: " + userDTO.getGenderId()));
            user.setGender(gender);
        }

        if (userDTO.getStatusId() != null) {
            Param status = paramRepository.findById(userDTO.getStatusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Status not found with id: " + userDTO.getStatusId()));
            user.setStatus(status);
        }

        userRepository.save(user);
        return convertToDTO(user);
    }

    public void deleteUserByPublicId(String publicId) {
        User user = userRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with publicId: " + publicId));
        userRepository.delete(user);
    }

    public UserDTO updateUserByEmail(String email, UserDTO userDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setAvatarUrl(userDTO.getAvatarUrl());

        if (userDTO.getGenderId() != null) {
            Param gender = paramRepository.findById(userDTO.getGenderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Gender not found with id: " + userDTO.getGenderId()));
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
        dto.setGenderId(user.getGender() != null ? user.getGender().getId() : null);
        dto.setStatusId(user.getStatus() != null ? user.getStatus().getId() : null);
        return dto;
    }
}
