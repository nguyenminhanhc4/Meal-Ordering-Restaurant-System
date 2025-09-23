package org.example.backend.config;

import org.example.backend.entity.Param;
import org.example.backend.entity.TableEntity;
import org.example.backend.entity.User;
import org.example.backend.repository.ParamRepository;
import org.example.backend.repository.TableRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ParamRepository paramRepository;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // you must define this bean in a @Configuration class

    @Override
    public void run(String... args) {
        // STATUS
        createParamIfNotExists("STATUS", "CONFIRMED", "Confirmed Reservation");
        createParamIfNotExists("STATUS", "CANCELLED", "Cancelled Reservation");
        createParamIfNotExists("STATUS", "PENDING", "Pending Reservation");
        createParamIfNotExists("STATUS", "AVAILABLE", "Available Table");
        createParamIfNotExists("STATUS", "OCCUPIED", "Occupied Table");

        // ROLE
        createParamIfNotExists("ROLE", "CUSTOMER", "Customer");
        createParamIfNotExists("ROLE", "STAFF", "Staff");
        createParamIfNotExists("ROLE", "ADMIN", "Admin");

        // GENDER
        createParamIfNotExists("GENDER", "MALE", "Male");
        createParamIfNotExists("GENDER", "FEMALE", "Female");

        // TABLES
        createTableIfNotExists("Table 1", 4);
        createTableIfNotExists("Table 2", 2);
        createTableIfNotExists("Table 3", 6);

        // ADMIN USER
        createAdminIfNotExists("admin@example.com", "Admin User", "admin123");
    }

    private void createParamIfNotExists(String type, String code, String name) {
        paramRepository.findByTypeAndCode(type, code)
                .orElseGet(() -> {
                    Param param = new Param();
                    param.setType(type);
                    param.setCode(code);
                    param.setName(name);
                    return paramRepository.save(param);
                });
    }

    private void createTableIfNotExists(String name, int capacity) {
        tableRepository.findByName(name)
                .orElseGet(() -> {
                    Param availableStatus = paramRepository.findByTypeAndCode("STATUS", "AVAILABLE")
                            .orElseThrow(() -> new RuntimeException("STATUS AVAILABLE not seeded"));

                    TableEntity table = new TableEntity();
                    table.setName(name);
                    table.setCapacity(capacity);
                    table.setStatusId(availableStatus.getId());
                    return tableRepository.save(table);
                });
    }

    private void createAdminIfNotExists(String email, String name, String rawPassword) {
        userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setPublicId(UUID.randomUUID().toString());
            user.setName(name);
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            user.setAvatarUrl(null);

            // set ROLE_ADMIN
            Param adminRole = paramRepository.findByTypeAndCode("ROLE", "ADMIN")
                    .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not seeded"));
            user.setRole(adminRole);

            // optional gender (set null or pick default)
            user.setGender(null);

            // set STATUS (active user)
            Param status = paramRepository.findByTypeAndCode("STATUS", "CONFIRMED")
                    .orElseThrow(() -> new RuntimeException("STATUS CONFIRMED not seeded"));
            user.setStatus(status);

            LocalDateTime now = LocalDateTime.now();
            user.setCreatedAt(now);
            user.setUpdatedAt(now);

            return userRepository.save(user);
        });
    }
}
