package org.example.backend.service.order;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.cart.CartDto;
import org.example.backend.dto.order.OrderDto;
import org.example.backend.dto.order.OrderMapper;
import org.example.backend.dto.order.OrderResponseDTO;
import org.example.backend.entity.cart.Cart;
import org.example.backend.entity.order.Order;
import org.example.backend.entity.order.OrderItem;
import org.example.backend.entity.param.Param;
import org.example.backend.repository.cart.CartRepository;
import org.example.backend.repository.menu.ComboRepository;
import org.example.backend.repository.menu.MenuItemRepository;
import org.example.backend.repository.order.OrderItemRepository;
import org.example.backend.repository.order.OrderRepository;
import org.example.backend.repository.order.OrderSpecification;
import org.example.backend.repository.param.ParamRepository;
import org.example.backend.repository.user.UserRepository;
import org.example.backend.entity.user.User;
import org.example.backend.service.notification.NotificationService;
import org.example.backend.util.WebSocketNotifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ParamRepository paramRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final ComboRepository comboRepository;
    private final WebSocketNotifier wsNotifier;
    private final NotificationService notificationService;
    private final WebSocketNotifier webSocketNotifier;

    @Transactional
    public OrderDto checkoutCart(CartDto cart) {
        // 1. Tạo Order entity
        Order order = new Order();
        order.setUser(userRepository.findById(cart.getUserId()).orElseThrow());
        Param status = paramRepository
                .findByTypeAndCode("ORDER_STATUS", "PENDING")
                .orElseThrow(() -> new RuntimeException("Order status not found"));

        order.setStatus(status);
        order.setTotalAmount(cart.getTotalAmount());
        order.setPublicId(UUID.randomUUID().toString());
        orderRepository.save(order);

        // 2️⃣ Thêm món lẻ (CartItems)
        if (cart.getItems() != null && !cart.getItems().isEmpty()) {
            for (var item : cart.getItems()) {
                OrderItem oi = new OrderItem();
                oi.setOrder(order);
                oi.setMenuItem(menuItemRepository.findById(item.getMenuItemId()).orElseThrow());
                oi.setQuantity(item.getQuantity());
                oi.setPrice(item.getPrice());
                orderItemRepository.save(oi);
            }
        }

        // 3️⃣ Thêm combo (CartComboItems)
        if (cart.getCombos() != null && !cart.getCombos().isEmpty()) {
            for (var comboItem : cart.getCombos()) {
                OrderItem oi = new OrderItem();
                oi.setOrder(order);
                oi.setCombo(comboRepository.findById(comboItem.getComboId()).orElseThrow());
                oi.setQuantity(comboItem.getQuantity());
                oi.setPrice(comboItem.getPrice());
                orderItemRepository.save(oi);
            }
        }


        // 3. Đổi trạng thái Cart
        Cart cartEntity = cartRepository.findById(cart.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        Param cartStatus = paramRepository.findByTypeAndCode("STATUS_CART","CANCELLED")
                .orElseThrow(() -> new RuntimeException("Invalid status code: " + "CANCELLED"));
        cartEntity.setStatus(cartStatus);
        cartRepository.save(cartEntity);

        // 4. Trả OrderDto về FE
        return new OrderDto(order);
    }

    public Page<OrderResponseDTO> getAllOrders(String status, String paymentStatus, String keyword, Pageable pageable) {
        Page<Order> orders = orderRepository.findAllWithCustomSort(status, paymentStatus, keyword, pageable);
        return orders.map(OrderMapper::toDto);
    }

    public OrderResponseDTO getOrderDetail(String publicId) {
        Order order = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return OrderMapper.toDto(order);
    }

    public List<OrderDto> findAll() {
        return orderRepository.findAll()
                .stream()
                .map(OrderDto::new)
                .collect(Collectors.toList());
    }

    public Optional<OrderDto> findById(Long id) {
        return orderRepository.findById(id).map(OrderDto::new);
    }

    public Optional<OrderDto> findByPublicId(String publicId) {
        return orderRepository.findByPublicId(publicId).map(OrderDto::new);
    }

    public OrderDto cancelOrder(String orderPublicId, String userPublicId) {
        Order order = orderRepository.findByPublicId(orderPublicId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Param statusParam = paramRepository.findByTypeAndCode("ORDER_STATUS", "CANCELLED" )
                .orElseThrow(() -> new RuntimeException("Invalid status code: " + "CANCELLED"));

        // Gán lại
        order.setStatus(statusParam);
        order = orderRepository.save(order);

        webSocketNotifier.notifyOrderCancelled(OrderMapper.toDto(order));
        return new OrderDto(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> findOrdersByUserPublicId(String userPublicId, int page, int size, String status) {
        User user = userRepository.findByPublicId(userPublicId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PageRequest pageable = PageRequest.of(page, size);
        Page<Order> orderPage = orderRepository.findByUserWithStatusOrder(status, user, pageable);

        return orderPage.map(OrderDto::new);
    }


    public OrderDto save(OrderDto dto) {
        Order entity = toEntity(dto);

        if (entity.getPublicId() == null) {
            entity.setPublicId(UUID.randomUUID().toString());
        }

        entity = orderRepository.save(entity);
        return new OrderDto(entity);
    }

    public OrderDto updateById(Long id, OrderDto dto) {
        Order entity = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        entity.setTotalAmount(dto.getTotalAmount());
        entity = orderRepository.save(entity);
        return new OrderDto(entity);
    }

    public OrderDto updateByPublicId(String publicId, OrderDto dto) {
        Order entity = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        entity.setTotalAmount(dto.getTotalAmount());
        entity = orderRepository.save(entity);
        return saveAndReturn(entity);
    }

    public OrderDto updateStatus(String publicId, String statusCode) {
        Order order = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Tìm Param tương ứng trong DB
        Param statusParam = paramRepository.findByTypeAndCode("ORDER_STATUS", statusCode )
                .orElseThrow(() -> new RuntimeException("Invalid status code: " + statusCode));

        // Gán lại
        order.setStatus(statusParam);

        // Lưu và trả về DTO
        order = orderRepository.save(order);
        wsNotifier.notifyOrderStatus(publicId, statusCode);
        // --- Tạo notification cho user dựa theo status ---
        switch (statusCode) {
            case "APPROVED":
                notificationService.notifyOrderApproved(order);
                break;
            case "CANCELLED":
                notificationService.notifyOrderCancelled(order);
                break;
            case "DELIVERED":
                notificationService.notifyOrderDelivered(order);
                break;
            case "DELIVERING":
                notificationService.notifyOrderDelivering(order);
                break;
            default:
                // Không gửi notification cho các trạng thái khác
                break;
        }
        return new OrderDto(order);
    }


    private OrderDto saveAndReturn(Order order) {
        Order saved = orderRepository.save(order);
        return new OrderDto(saved);
    }

    public void deleteById(Long id) {
        Order entity = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        orderRepository.delete(entity);
    }

    public void deleteByPublicId(String publicId) {
        Order entity = orderRepository.findByPublicId(publicId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        orderRepository.delete(entity);
    }

    private Order toEntity(OrderDto dto) {
        Order entity = new Order();
        entity.setId(dto.getId());
        entity.setPublicId(dto.getPublicId());
        entity.setTotalAmount(dto.getTotalAmount());

        if (getUserPublicId(dto) != null) {
            User user = userRepository.findByPublicId(getUserPublicId(dto))
                    .orElseThrow(() -> new RuntimeException("User not found"));
            entity.setUser(user);
        } else if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            entity.setUser(user);
        }
        return entity;
    }

    private String getUserPublicId(OrderDto dto) {
        Long userId = dto.getUserId();
        Optional<User> user = userRepository.findById(userId);
        String pulicid = user.get().getPublicId();
        return pulicid;
    }
}
