package org.example.backend.dto.statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemSalesDto {
    private Long menuItemId;
    private String menuItemName;
    private Long totalQuantitySold;
    private BigDecimal totalRevenue;
    private String avatarUrl;
}
