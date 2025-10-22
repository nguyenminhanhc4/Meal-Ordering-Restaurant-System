package org.example.backend.controller.payment;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.order.OrderMapper;
import org.example.backend.dto.payment.PaymentDto;
import org.example.backend.dto.payment.PaymentRequestDto;
import org.example.backend.entity.menu.MenuItem;
import org.example.backend.entity.order.Order;
import org.example.backend.entity.param.Param;
import org.example.backend.entity.payment.Payment;
import org.example.backend.entity.user.ShippingInfo;
import org.example.backend.repository.menu.MenuItemRepository;
import org.example.backend.repository.order.OrderRepository;
import org.example.backend.repository.param.ParamRepository;
import org.example.backend.repository.payment.PaymentRepository;
import org.example.backend.repository.user.ShippingInfoRepository;
import org.example.backend.service.menu.MenuItemService;
import org.example.backend.util.WebSocketNotifier;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/mock-payments")
@RequiredArgsConstructor
public class MockPaymentController {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final ParamRepository paramRepository;
    private final MenuItemRepository menuItemRepository;
    private final ShippingInfoRepository shippingInfoRepository;
    private final MenuItemService menuItemService;
    private final SimpMessagingTemplate messagingTemplate;
    private final WebSocketNotifier webSocketNotifier;

    /**
     * 1️⃣ Initiate payment (API FE gọi)
     */
    @PostMapping("/initiate")
    @ResponseBody
    @PreAuthorize("isAuthenticated()")
    public Map<String, String> initiatePayment(@RequestBody Map<String, String> body) {
        Long orderId = Long.valueOf(body.get("orderId"));
        String returnUrl = "http://localhost:5173/payments/success";

        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));

        Param statusPending = paramRepository.findByTypeAndCode("PAYMENT_STATUS", "PENDING").orElseThrow();

        Payment payment = Payment.builder().order(order).amount(order.getTotalAmount()).status(statusPending).paymentMethod(paramRepository.findByTypeAndCode("PAYMENT_METHOD", "ONLINE").orElseThrow()).publicId(UUID.randomUUID().toString()).returnUrl(returnUrl).build();

        paymentRepository.save(payment);

        return Map.of("paymentId", payment.getPublicId(), "redirectUrl", "/mock-payments/checkout/" + payment.getPublicId());
    }

    /**
     * 2️⃣ Mock Checkout Page (hiển thị approve/cancel)
     */
    @GetMapping("/checkout/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public PaymentDto getPayment(@PathVariable String publicId) {
        Payment payment = paymentRepository.findByPublicId(publicId).orElseThrow(() -> new RuntimeException("Payment not found"));
        return new PaymentDto(payment);
    }

    /**
     * 3️⃣ Approve payment
     */
    @PostMapping("/approve/{publicId}")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public Map<String, String> approvePayment(@PathVariable String publicId, @RequestBody PaymentRequestDto shipping) {
        Payment payment = paymentRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        Param statusSuccess = paramRepository.findByTypeAndCode("PAYMENT_STATUS", "COMPLETED").orElseThrow();
        Param orderPending = paramRepository.findByTypeAndCode("ORDER_STATUS", "PENDING").orElseThrow();

        // Update payment
        payment.setStatus(statusSuccess);
        payment.setTransactionId("MOCK-" + UUID.randomUUID());
        paymentRepository.save(payment);

        // Update order
        Order order = payment.getOrder();
        order.setStatus(orderPending);
        orderRepository.save(order);

        // Tạo shipping info
        ShippingInfo shippingInfo = new ShippingInfo();
        shippingInfo.setPayment(payment);
        shippingInfo.setFullName(shipping.getFullName());
        shippingInfo.setEmail(shipping.getEmail());
        shippingInfo.setPhone(shipping.getPhone());
        shippingInfo.setAddress(shipping.getAddress());
        shippingInfo.setNote(shipping.getNote());
        shippingInfoRepository.save(shippingInfo);

        // Giảm tồn kho
        List<Long> affectedMenuIds = menuItemService.reduceInventory(order.getId());
        for (Long id : affectedMenuIds) {
            webSocketNotifier.notifyMenuItemStock(id);
        }
        webSocketNotifier.notifyNewOrderForAdmin(OrderMapper.toDto(order));

        // Chỉ trả redirectUrl
        return Map.of("redirectUrl", payment.getReturnUrl());
    }


    /**
     * 4️⃣ Cancel payment
     */
    @PostMapping("/cancel/{publicId}")
    @PreAuthorize("isAuthenticated()")
    public Map<String, String> cancelPayment(@PathVariable String publicId) {
        Payment payment = paymentRepository.findByPublicId(publicId).orElseThrow(() -> new RuntimeException("Payment not found"));

        Param statusFailed = paramRepository.findByTypeAndCode("PAYMENT_STATUS", "FAILED").orElseThrow();


        // Update Payment
        payment.setStatus(statusFailed);
        payment.setTransactionId("MOCK-" + UUID.randomUUID());
        paymentRepository.save(payment);

        return Map.of("redirectUrl", "http://localhost:5173/payments/failed");
    }
}
