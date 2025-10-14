package org.example.backend.dto.menu;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemSearchRequest {
    
    private String name;
    private String description;
    private Long categoryId;
    private Long statusId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String sortBy = "id"; // id, name, price, createdAt
    private String sortDirection = "desc"; // asc, desc
}