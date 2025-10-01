package org.example.backend.controller.payment;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.payment.PaymentRequestDto;
import org.example.backend.entity.order.Order;
import org.example.backend.entity.param.Param;
import org.example.backend.repository.order.OrderRepository;
import org.example.backend.repository.param.ParamRepository;
import org.example.backend.repository.payment.PaymentRepository;
import org.example.backend.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.example.backend.dto.payment.PaymentDto;
import org.example.backend.entity.payment.Payment;
import org.example.backend.service.payment.PaymentService;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final ParamRepository paramRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final JwtUtil jwtUtil;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentDto> createPayment(@RequestBody PaymentRequestDto request, @CookieValue("token") String token) {
        String publicId = jwtUtil.getPublicIdFromToken(token);
        PaymentDto payment = paymentService.createPayment(request,publicId);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/{orderPublicId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentDto> getPaymentByOrderPublicId(@PathVariable String  orderPublicId) {
        Order order = orderRepository.findByPublicId(orderPublicId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        return ResponseEntity.ok(new PaymentDto(payment));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentDto> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam String statusCode,
            @RequestParam(required = false) String transactionId
    )  {
        Param status = paramRepository.findByTypeAndCode("PAYMENT_STATUS", statusCode)
                .orElseThrow(() -> new IllegalArgumentException("Invalid status code: " + statusCode));

        PaymentDto updated = paymentService.updatePaymentStatus(id, status, transactionId);
        return ResponseEntity.ok(updated);
    }
}
