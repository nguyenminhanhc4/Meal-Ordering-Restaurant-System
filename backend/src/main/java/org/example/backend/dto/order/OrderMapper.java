package org.example.backend.dto.order;

import org.example.backend.entity.order.Order;
import org.example.backend.entity.order.OrderItem;
import org.example.backend.entity.payment.Payment;
import org.example.backend.entity.user.ShippingInfo;

import java.util.List;
import java.util.stream.Collectors;

public class OrderMapper {

    public static OrderResponseDTO toDto(Order order) {
        if (order == null) return null;

        Payment payment = order.getPayment();
        ShippingInfo shipping = (payment != null) ? payment.getShippingInfo() : null;

        return OrderResponseDTO.builder()
                .publicId(order.getPublicId())
                .userName(order.getUser() != null ? order.getUser().getName() : null)
                .userEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .status(order.getStatus() != null ? order.getStatus().getCode() : null)
                .totalAmount(order.getTotalAmount())
                .paymentStatus(payment != null && payment.getStatus() != null ? payment.getStatus().getCode() : null)
                .paymentMethod(payment != null && payment.getPaymentMethod() != null ? payment.getPaymentMethod().getCode() : null)
                .shippingAddress(shipping != null ? shipping.getAddress() : null)
                .shippingPhone(shipping != null ? shipping.getPhone() : null)
                .createdAt(order.getCreatedAt())
                .items(toItemDtoList(order.getOrderItems()))
                .build();
    }

    private static List<OrderItemDto> toItemDtoList(List<OrderItem> items) {
        if (items == null) return List.of();
        return items.stream().map(item -> OrderItemDto.builder()
                .id(item.getId())
                .menuItemId(item.getMenuItem() != null ? item.getMenuItem().getId() : null)
                .comboId(item.getCombo() != null ? item.getCombo().getId() : null)
                .menuItemName(item.getMenuItem() != null ? item.getMenuItem().getName() : null)
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .build()
        ).collect(Collectors.toList());
    }

}
