package org.example.backend.dto;

import lombok.*;
import org.example.backend.entity.MenuItem;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
public class MenuItemDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Long categoryId;
    private String categoryName;
    private String status;   // AVAILABLE / OUT_OF_STOCK
    private String avatarUrl;

    private List<IngredientDto> ingredients;

    public MenuItemDto(MenuItem menuItem) {
        if (menuItem != null) {
            this.setId(menuItem.getId());
            this.name = menuItem.getName();
            this.description = menuItem.getDescription();
            this.price = menuItem.getPrice();
            if (menuItem.getCategory() != null) {
                this.categoryId = menuItem.getCategory().getId();
                this.categoryName = menuItem.getCategory().getName();
            }
            if (menuItem.getStatus() != null) {
                this.status = menuItem.getStatus().getCode();
            }
            this.avatarUrl = menuItem.getAvatarUrl();
        }
    }
}
