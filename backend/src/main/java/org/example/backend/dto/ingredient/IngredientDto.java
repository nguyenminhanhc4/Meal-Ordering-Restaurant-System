package org.example.backend.dto.ingredient;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.entity.ingredient.Ingredient;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class IngredientDto {
    private Long id;
    private String name;
    private Integer quantity;
    private String unit;
    private Integer minimumStock;
    private LocalDateTime lastUpdated;

    public IngredientDto(Ingredient ingredient) {
        if (ingredient != null) {
            this.id = ingredient.getId();
            this.name = ingredient.getName();
            this.quantity = ingredient.getQuantity();
            this.unit = ingredient.getUnit();
            this.minimumStock = ingredient.getMinimumStock();
            this.lastUpdated = ingredient.getLastUpdated();
        }
    }
}
