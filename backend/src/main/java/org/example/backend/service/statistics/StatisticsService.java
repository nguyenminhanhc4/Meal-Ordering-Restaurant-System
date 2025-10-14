package org.example.backend.service.statistics;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.statistics.MenuItemSalesDto;
import org.example.backend.dto.statistics.RevenueStatisticsDto;
import org.example.backend.repository.order.OrderItemRepository;
import org.example.backend.repository.order.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    /**
     * Get revenue statistics by day within a date range
     */
    @Transactional(readOnly = true)
    public List<RevenueStatisticsDto> getRevenueStatisticsByDay(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Map<String, Object>> results = orderRepository.getRevenueStatisticsByDay(startDateTime, endDateTime);
        return convertToRevenueStatistics(results);
    }

    /**
     * Get revenue statistics by month within a date range
     */
    @Transactional(readOnly = true)
    public List<RevenueStatisticsDto> getRevenueStatisticsByMonth(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Map<String, Object>> results = orderRepository.getRevenueStatisticsByMonth(startDateTime, endDateTime);
        return convertToRevenueStatistics(results);
    }

    /**
     * Get revenue statistics by year within a date range
     */
    @Transactional(readOnly = true)
    public List<RevenueStatisticsDto> getRevenueStatisticsByYear(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Map<String, Object>> results = orderRepository.getRevenueStatisticsByYear(startDateTime, endDateTime);
        return convertToRevenueStatistics(results);
    }

    /**
     * Get revenue statistics for current month by day
     */
    @Transactional(readOnly = true)
    public List<RevenueStatisticsDto> getCurrentMonthRevenueByDay() {
        YearMonth currentMonth = YearMonth.now();
        LocalDate startDate = currentMonth.atDay(1);
        LocalDate endDate = currentMonth.atEndOfMonth();
        return getRevenueStatisticsByDay(startDate, endDate);
    }

    /**
     * Get revenue statistics for current year by month
     */
    @Transactional(readOnly = true)
    public List<RevenueStatisticsDto> getCurrentYearRevenueByMonth() {
        LocalDate startDate = LocalDate.now().withDayOfYear(1);
        LocalDate endDate = LocalDate.now().withMonth(12).withDayOfMonth(31);
        return getRevenueStatisticsByMonth(startDate, endDate);
    }

    /**
     * Get best-selling menu items
     */
    @Transactional(readOnly = true)
    public List<MenuItemSalesDto> getBestSellingMenuItems(LocalDate startDate, LocalDate endDate, int limit) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Map<String, Object>> results = orderItemRepository.getBestSellingMenuItems(startDateTime, endDateTime, limit);
        return convertToMenuItemSales(results);
    }

    /**
     * Get worst-selling menu items (flop items)
     */
    @Transactional(readOnly = true)
    public List<MenuItemSalesDto> getWorstSellingMenuItems(LocalDate startDate, LocalDate endDate, int limit) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Map<String, Object>> results = orderItemRepository.getWorstSellingMenuItems(startDateTime, endDateTime, limit);
        return convertToMenuItemSales(results);
    }

    /**
     * Get best-selling menu items for current month
     */
    @Transactional(readOnly = true)
    public List<MenuItemSalesDto> getCurrentMonthBestSelling(int limit) {
        YearMonth currentMonth = YearMonth.now();
        LocalDate startDate = currentMonth.atDay(1);
        LocalDate endDate = currentMonth.atEndOfMonth();
        return getBestSellingMenuItems(startDate, endDate, limit);
    }

    /**
     * Get worst-selling menu items for current month
     */
    @Transactional(readOnly = true)
    public List<MenuItemSalesDto> getCurrentMonthWorstSelling(int limit) {
        YearMonth currentMonth = YearMonth.now();
        LocalDate startDate = currentMonth.atDay(1);
        LocalDate endDate = currentMonth.atEndOfMonth();
        return getWorstSellingMenuItems(startDate, endDate, limit);
    }

    // Helper methods

    private List<RevenueStatisticsDto> convertToRevenueStatistics(List<Map<String, Object>> results) {
        return results.stream()
                .map(result -> RevenueStatisticsDto.builder()
                        .period(String.valueOf(result.get("period")))
                        .totalRevenue(new BigDecimal(String.valueOf(result.get("totalRevenue"))))
                        .totalOrders(((Number) result.get("totalOrders")).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<MenuItemSalesDto> convertToMenuItemSales(List<Map<String, Object>> results) {
        return results.stream()
                .map(result -> MenuItemSalesDto.builder()
                        .menuItemId(((Number) result.get("menuItemId")).longValue())
                        .menuItemName(String.valueOf(result.get("menuItemName")))
                        .totalQuantitySold(((Number) result.get("totalQuantitySold")).longValue())
                        .totalRevenue(new BigDecimal(String.valueOf(result.get("totalRevenue"))))
                        .avatarUrl(result.get("avatarUrl") != null ? String.valueOf(result.get("avatarUrl")) : null)
                        .build())
                .collect(Collectors.toList());
    }
}
