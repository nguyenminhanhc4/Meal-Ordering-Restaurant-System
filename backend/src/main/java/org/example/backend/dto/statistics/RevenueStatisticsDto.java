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
public class RevenueStatisticsDto {
    private String period; // Date string (yyyy-MM-dd, yyyy-MM, or yyyy)
    private BigDecimal totalRevenue;
    private Long totalOrders;
}
