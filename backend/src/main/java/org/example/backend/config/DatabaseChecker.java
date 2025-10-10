package org.example.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseChecker implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        String dbName = jdbcTemplate.queryForObject("SELECT DATABASE()", String.class);
        String dbUser = jdbcTemplate.queryForObject("SELECT USER()", String.class);
        System.out.println("✅ Connected to database: " + dbName);
        System.out.println("👤 Using user: " + dbUser);
    }
}
