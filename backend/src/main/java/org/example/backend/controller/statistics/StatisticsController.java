package org.example.backend.controller.statistics;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.statistics.MenuItemSalesDto;
import org.example.backend.dto.statistics.RevenueStatisticsDto;
import org.example.backend.service.statistics.StatisticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/statistics")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Statistics", description = "Statistics management APIs for admin dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class StatisticsController {

    private final StatisticsService statisticsService;

    // ==================== Revenue Statistics ====================

    @GetMapping("/revenue/day")
    @Operation(summary = "Get revenue statistics by day", 
               description = "Get revenue statistics grouped by day within a date range")
    public ResponseEntity<List<RevenueStatisticsDto>> getRevenueByDay(
            @Parameter(description = "Start date (yyyy-MM-dd)", example = "2024-01-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)", example = "2024-01-31")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Getting revenue statistics by day from {} to {}", startDate, endDate);
        List<RevenueStatisticsDto> statistics = statisticsService.getRevenueStatisticsByDay(startDate, endDate);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/revenue/month")
    @Operation(summary = "Get revenue statistics by month", 
               description = "Get revenue statistics grouped by month within a date range")
    public ResponseEntity<List<RevenueStatisticsDto>> getRevenueByMonth(
            @Parameter(description = "Start date (yyyy-MM-dd)", example = "2024-01-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)", example = "2024-12-31")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Getting revenue statistics by month from {} to {}", startDate, endDate);
        List<RevenueStatisticsDto> statistics = statisticsService.getRevenueStatisticsByMonth(startDate, endDate);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/revenue/year")
    @Operation(summary = "Get revenue statistics by year", 
               description = "Get revenue statistics grouped by year within a date range")
    public ResponseEntity<List<RevenueStatisticsDto>> getRevenueByYear(
            @Parameter(description = "Start date (yyyy-MM-dd)", example = "2020-01-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)", example = "2024-12-31")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Getting revenue statistics by year from {} to {}", startDate, endDate);
        List<RevenueStatisticsDto> statistics = statisticsService.getRevenueStatisticsByYear(startDate, endDate);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/revenue/current-month")
    @Operation(summary = "Get current month revenue by day", 
               description = "Get revenue statistics for the current month grouped by day")
    public ResponseEntity<List<RevenueStatisticsDto>> getCurrentMonthRevenue() {
        log.info("Getting current month revenue statistics by day");
        List<RevenueStatisticsDto> statistics = statisticsService.getCurrentMonthRevenueByDay();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/revenue/current-year")
    @Operation(summary = "Get current year revenue by month", 
               description = "Get revenue statistics for the current year grouped by month")
    public ResponseEntity<List<RevenueStatisticsDto>> getCurrentYearRevenue() {
        log.info("Getting current year revenue statistics by month");
        List<RevenueStatisticsDto> statistics = statisticsService.getCurrentYearRevenueByMonth();
        return ResponseEntity.ok(statistics);
    }

    // ==================== Menu Item Sales Statistics ====================

    @GetMapping("/menu-items/best-selling")
    @Operation(summary = "Get best-selling menu items", 
               description = "Get the top best-selling menu items within a date range")
    public ResponseEntity<List<MenuItemSalesDto>> getBestSellingMenuItems(
            @Parameter(description = "Start date (yyyy-MM-dd)", example = "2024-01-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)", example = "2024-01-31")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Number of items to return", example = "10")
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Getting best-selling menu items from {} to {}, limit: {}", startDate, endDate, limit);
        List<MenuItemSalesDto> menuItems = statisticsService.getBestSellingMenuItems(startDate, endDate, limit);
        return ResponseEntity.ok(menuItems);
    }

    @GetMapping("/menu-items/worst-selling")
    @Operation(summary = "Get worst-selling menu items (flop)", 
               description = "Get the worst-selling or least popular menu items within a date range")
    public ResponseEntity<List<MenuItemSalesDto>> getWorstSellingMenuItems(
            @Parameter(description = "Start date (yyyy-MM-dd)", example = "2024-01-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)", example = "2024-01-31")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Number of items to return", example = "10")
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Getting worst-selling menu items from {} to {}, limit: {}", startDate, endDate, limit);
        List<MenuItemSalesDto> menuItems = statisticsService.getWorstSellingMenuItems(startDate, endDate, limit);
        return ResponseEntity.ok(menuItems);
    }

    @GetMapping("/menu-items/current-month/best-selling")
    @Operation(summary = "Get current month best-selling menu items", 
               description = "Get the top best-selling menu items for the current month")
    public ResponseEntity<List<MenuItemSalesDto>> getCurrentMonthBestSelling(
            @Parameter(description = "Number of items to return", example = "10")
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Getting current month best-selling menu items, limit: {}", limit);
        List<MenuItemSalesDto> menuItems = statisticsService.getCurrentMonthBestSelling(limit);
        return ResponseEntity.ok(menuItems);
    }

    @GetMapping("/menu-items/current-month/worst-selling")
    @Operation(summary = "Get current month worst-selling menu items (flop)", 
               description = "Get the worst-selling menu items for the current month")
    public ResponseEntity<List<MenuItemSalesDto>> getCurrentMonthWorstSelling(
            @Parameter(description = "Number of items to return", example = "10")
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Getting current month worst-selling menu items, limit: {}", limit);
        List<MenuItemSalesDto> menuItems = statisticsService.getCurrentMonthWorstSelling(limit);
        return ResponseEntity.ok(menuItems);
    }
}
