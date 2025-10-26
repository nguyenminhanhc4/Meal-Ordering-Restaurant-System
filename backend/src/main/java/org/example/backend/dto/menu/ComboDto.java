package org.example.backend.dto.menu;

import lombok.Data;
import org.example.backend.entity.category.Categories;
import org.example.backend.entity.menu.Combo;
import org.example.backend.entity.menu.MenuItem;
import org.example.backend.entity.param.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class ComboDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private double discountPercent;
    private Boolean available;

    // === Combo Type (bundle category: Family, Couple, etc.) ===
    private Long typeCategoryId;
    private String typeCategoryName;

    // === Combo Availability ===
    private Long availabilityCategoryIds;
    private String availabilityCategoryNames;

    // === Combo People (serving size) ===
    private Long peopleCategoryId;
    private String peopleCategoryName;

    // === Combo Status ===
    private Long statusId;
    private String statusName;

    // === Items inside the combo ===
    private List<Long> menuItemIds;
    private List<String> menuItemNames;

    // ✅ Constructor to map from entity
    public ComboDto(Combo combo) {
        this.id = combo.getId();
        this.name = combo.getName();
        this.description = combo.getDescription();
        this.price = combo.getPrice();
        this.discountPercent = combo.getDiscountPercent();
        this.available = combo.getAvailable();

        // 🔹 Type Category
        Categories type = combo.getTypeCategory();
        if (type != null) {
            this.typeCategoryId = type.getId();
            this.typeCategoryName = type.getName();
        }

        // 🔹 Multiple Availability Categories
        if (combo.getAvailabilityCategories() != null) {
            this.availabilityCategoryIds = combo.getAvailabilityCategories()
                            .getId();
//                    .stream()
//                    .map(Categories::getId)
//                    .collect(Collectors.toList());

            this.availabilityCategoryNames = combo.getAvailabilityCategories()
                            .getName();
//                    .stream()
//                    .map(Categories::getName)
//                    .collect(Collectors.toList());
        }

        // 🔹 People Category
        Categories people = combo.getPeopleCategory();
        if (people != null) {
            this.peopleCategoryId = people.getId();
            this.peopleCategoryName = people.getName();
        }

        // 🔹 Status (Param)
        Param status = combo.getStatus();
        if (status != null) {
            this.statusId = status.getId();
            this.statusName = status.getName();
        }

        // 🔹 Combo Items
        if (combo.getMenuItems() != null && !combo.getMenuItems().isEmpty()) {
            this.menuItemIds = combo.getMenuItems()
                    .stream()
                    .map(MenuItem::getId)
                    .collect(Collectors.toList());

            this.menuItemNames = combo.getMenuItems()
                    .stream()
                    .map(MenuItem::getName)
                    .collect(Collectors.toList());
        }
    }
}
