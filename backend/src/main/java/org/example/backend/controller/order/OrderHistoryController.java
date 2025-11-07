package org.example.backend.controller.order;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.order.OrderHistoryDto;
import org.example.backend.entity.order.Order;
import org.example.backend.service.order.OrderHistoryService;
import org.example.backend.service.user.UserService;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/orders/history")
@RequiredArgsConstructor
public class OrderHistoryController {

    private final OrderHistoryService orderHistoryService;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<OrderHistoryDto>> getOrderHistory(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Long userId = userService.getUserByEmail(email).getId();

        Page<Order> orders = orderHistoryService.getOrderHistory(userId, keyword, status, fromDate, toDate, pageable);
        Page<OrderHistoryDto> dtoPage = orders.map(OrderHistoryDto::fromEntity);

        return ResponseEntity.ok(dtoPage);
    }
}
