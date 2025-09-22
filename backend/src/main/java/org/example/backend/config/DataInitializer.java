package org.example.backend.config;

import org.example.backend.entity.Param;
import org.example.backend.entity.TableEntity;
import org.example.backend.repository.ParamRepository;
import org.example.backend.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ParamRepository paramRepository;

    @Autowired
    private TableRepository tableRepository;

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
                    // find STATUS=AVAILABLE
                    Param availableStatus = paramRepository.findByTypeAndCode("STATUS", "AVAILABLE")
                            .orElseThrow(() -> new RuntimeException("STATUS AVAILABLE not seeded"));

                    TableEntity table = new TableEntity();
                    table.setName(name);
                    table.setCapacity(capacity);
                    table.setStatusId(availableStatus.getId()); // store FK id
                    return tableRepository.save(table);
                });
    }
}

