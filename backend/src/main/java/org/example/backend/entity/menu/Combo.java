package org.example.backend.entity.menu;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.example.backend.entity.BaseEntity;
import org.example.backend.entity.category.Categories;
import org.example.backend.entity.param.Param;

import java.math.BigDecimal;
import java.math.RoundingMode;
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

    // 🔹 Combo includes several menu items
    @ManyToMany
    @JoinTable(
            name = "combo_items",
            joinColumns = @JoinColumn(name = "combo_id"),
            inverseJoinColumns = @JoinColumn(name = "menu_item_id")
    )
    private List<MenuItem> menuItems;

    @PrePersist
    @PreUpdate
    public void updatePrice() {
        this.price = calculateTotalPrice();
    }

    public BigDecimal calculateTotalPrice() {
        if (menuItems == null || menuItems.isEmpty()) return BigDecimal.ZERO;

        BigDecimal sum = menuItems.stream()
                .map(MenuItem::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discount = sum
                .multiply(BigDecimal.valueOf(discountPercent))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        return sum.subtract(discount).setScale(2, RoundingMode.HALF_UP);
    }
}
