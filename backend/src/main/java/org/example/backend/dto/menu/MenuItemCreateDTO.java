package org.example.backend.dto.menu;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemCreateDTO {
    
    @NotBlank(message = "Name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    private String name;
    
    private String description;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;
    
    @NotNull(message = "Category is required")
    private Long categoryId;
    
    @NotNull(message = "Status is required")
    private Long statusId;
    
    private String avatarUrl;
    
    private Integer availableQuantity;
    
    // List of ingredients with their required quantities
    private List<MenuItemIngredientCreateDTO> ingredients;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuItemIngredientCreateDTO {
        @NotNull(message = "Ingredient ID is required")
        private Long ingredientId;
        
        @NotNull(message = "Quantity needed is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be greater than 0")
        private BigDecimal quantityNeeded;
    }
}