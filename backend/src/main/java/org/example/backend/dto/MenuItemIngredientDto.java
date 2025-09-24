package org.example.backend.dto;

import lombok.*;
import org.example.backend.entity.MenuItemIngredient;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemIngredientDto {

    private Long id;
    private Long menuItemId;
    private Long ingredientId;
    private String ingredientName;
    private BigDecimal quantityNeeded;

    public MenuItemIngredientDto(MenuItemIngredient entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.menuItemId = entity.getMenuItem().getId();
            this.ingredientId = entity.getIngredient().getId();
            this.ingredientName = entity.getIngredient().getName();
            this.quantityNeeded = entity.getQuantityNeeded();
        }
    }
}
