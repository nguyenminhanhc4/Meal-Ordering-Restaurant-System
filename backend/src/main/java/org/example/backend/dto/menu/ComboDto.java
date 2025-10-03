package org.example.backend.dto.menu;

import lombok.*;
import org.example.backend.entity.menu.Combo;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComboDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;

    private Long categoryId;
    private String categoryName;

    private Long statusId;
    private String statusName;

    private String avatarUrl;

    private List<Long> itemIds; // only menu items

    // Constructor to map from entity
    public ComboDto(Combo combo) {
        if (combo == null) return;

        this.id = combo.getId();
        this.name = combo.getName();
        this.description = combo.getDescription();
        this.price = combo.getPrice();

        if (combo.getCategory() != null) {
            this.categoryId = combo.getCategory().getId();
            this.categoryName = combo.getCategory().getName();
        }

        if (combo.getStatus() != null) {
            this.statusId = combo.getStatus().getId();
            this.statusName = combo.getStatus().getName();
        }

        this.avatarUrl = combo.getAvatarUrl();

        if (combo.getItems() != null) {
            this.itemIds = combo.getItems().stream()
                    .map(i -> i.getId())
                    .toList();
        }
    }
}
