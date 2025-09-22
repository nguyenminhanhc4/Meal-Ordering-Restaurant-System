package org.example.backend.util;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;

public class DataUtil {
    public static final String DEFAULT_DATE_PATTERN = "yyyy-MM-dd";
    public static final String DEFAULT_DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
    public static final String DEFAULT_CURRENCY_PATTERN = "#,##0.00";

    /**
     * Format a java.util.Date using the given pattern.
     */
    public static String formatDate(Date date, String pattern) {
        if (date == null) return null;
        SimpleDateFormat formatter = new SimpleDateFormat(pattern);
        return formatter.format(date);
    }

    /**
     * Format a LocalDateTime using the given pattern.
     */
    public static String formatDate(LocalDateTime dateTime, String pattern) {
        if (dateTime == null) return null;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        return dateTime.format(formatter);
    }

    /**
     * Convert LocalDateTime to java.util.Date (useful if needed).
     */
    public static Date toDate(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return Date.from(dateTime.atZone(ZoneId.systemDefault()).toInstant());
    }

    /**
     * Format a BigDecimal price using the given pattern.
     */
    public static String formatPrice(BigDecimal price, String pattern) {
        if (price == null) {
            return "0";
        }
        DecimalFormat formatter = new DecimalFormat(pattern);
        return formatter.format(price);
    }
}
