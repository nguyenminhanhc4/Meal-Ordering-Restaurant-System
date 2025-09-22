package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "ingredients")
@Data
public class Ingredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer quantity;

    @Column(length = 50)
    private String unit; // e.g. KG, GRAM, LITER

    @Column(name = "minimum_stock")
    private Integer minimumStock;

    @Column(name = "last_updated", insertable = false, updatable = false)
    private LocalDateTime lastUpdated;
}
