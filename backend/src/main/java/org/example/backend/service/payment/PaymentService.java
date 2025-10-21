package org.example.backend.service.payment;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.payment.PaymentRequestDto;
import org.example.backend.entity.order.Order;
import org.example.backend.entity.param.Param;
import org.example.backend.entity.payment.Payment;
import org.example.backend.entity.user.ShippingInfo;
import org.example.backend.repository.order.OrderRepository;
import org.example.backend.repository.param.ParamRepository;
import org.example.backend.repository.user.ShippingInfoRepository;
import org.example.backend.service.menu.MenuItemService;
import org.example.backend.util.WebSocketNotifier;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.example.backend.dto.payment.PaymentDto;
import org.example.backend.repository.payment.PaymentRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final ParamRepository paramRepository;
    private final ShippingInfoRepository shippingInfoRepository;
    private final MenuItemService menuItemService;
    private final WebSocketNotifier webSocketNotifier;

    @Transactional
    public PaymentDto createPayment(PaymentRequestDto request, String publicId) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getPublicId().equals(publicId)) {
            throw new RuntimeException("Not allowed to pay for this order");
        }

        if (paymentRepository.findByOrderId(order.getId()).isPresent()) {
            throw new RuntimeException("Payment already exists for this order");
        }

        Param method = paramRepository.findByTypeAndCode("PAYMENT_METHOD", request.getPaymentMethodCode())
                .orElseThrow(() -> new RuntimeException("Invalid payment method"));

        Param pendingStatus = paramRepository.findByTypeAndCode("PAYMENT_STATUS","PENDING")
                .orElseThrow(() -> new RuntimeException("Missing PENDING status"));

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(method);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(pendingStatus);
        payment.setPublicId(UUID.randomUUID().toString());

        Payment savedPayment = paymentRepository.save(payment);

        // --- Tạo shipping info ---
        ShippingInfo shippingInfo = new ShippingInfo();
        shippingInfo.setPayment(savedPayment);
        shippingInfo.setFullName(request.getFullName());
        shippingInfo.setEmail(request.getEmail());
        shippingInfo.setPhone(request.getPhone());
        shippingInfo.setAddress(request.getAddress());
        shippingInfo.setNote(request.getNote());
        shippingInfoRepository.save(shippingInfo); // cần inject repository

        Param statusOrder = paramRepository.findByTypeAndCode("ORDER_STATUS","PENDING").get();
        order.setStatus(statusOrder);
        orderRepository.save(order);

        List<Long> affectedMenuIds = menuItemService.reduceInventory(order.getId());

        PaymentDto dto = new PaymentDto(savedPayment);
        for (Long id : affectedMenuIds) {
            webSocketNotifier.notifyMenuItemStock(id);
        }
        return dto;
    }

    public PaymentDto updatePaymentStatus(Long id, Param status, String transactionId) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setStatus(status);
        payment.setTransactionId(transactionId);
        return new PaymentDto(paymentRepository.save(payment));
    }
}
