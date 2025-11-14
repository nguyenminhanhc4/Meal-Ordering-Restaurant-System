package org.example.backend.entity.menu;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.backend.entity.BaseEntity;
import org.example.backend.entity.category.Categories;
import org.example.backend.entity.param.Param;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@Entity
@Table(name = "combos")
public class Combo extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private Boolean available = true;

    // 🔹 Combo Type (e.g. Family Combo, Couple Combo)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_category_id")
    private Categories typeCategory;

//    @ManyToMany(fetch = FetchType.LAZY)
//    @JoinTable(
//            name = "combo_availabilities",
//            joinColumns = @JoinColumn(name = "combo_id"),
//            inverseJoinColumns = @JoinColumn(name = "category_id")
//    )

    @ManyToOne
    @JoinColumn(name = "availability_category_id")
    private Categories availabilityCategories;

    // 🔹 Combo People (e.g. Couple, Family Large)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "people_category_id")
    private Categories peopleCategory;

    // 🔹 Combo Status — still uses Param (system-level)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private Param status;

    private double discountPercent; // e.g. 10 means 10%

    @OneToMany(mappedBy = "combo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComboItem> items = new ArrayList<>();
}
