package org.example.backend.entity.ingredient;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.backend.entity.BaseEntity;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "ingredients")
@Data
@EntityListeners(AuditingEntityListener.class)
public class Ingredient extends BaseEntity {
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
}
