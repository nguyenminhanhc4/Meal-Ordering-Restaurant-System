package org.example.backend.service.order;

import lombok.RequiredArgsConstructor;
<<<<<<< HEAD:backend/src/main/java/org/example/backend/service/order/OrderService.java
import org.example.backend.dto.order.OrderDto;
import org.example.backend.entity.order.Order;
import org.example.backend.repository.order.OrderRepository;
import org.example.backend.repository.user.UserRepository;
=======
import org.example.backend.dto.OrderDto;
import org.example.backend.entity.Order;
import org.example.backend.entity.User;
import org.example.backend.repository.OrderRepository;
import org.example.backend.repository.UserRepository;
>>>>>>> long:backend/src/main/java/org/example/backend/service/OrderService.java
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

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

    public List<OrderDto> findAllOrderByUserPublicId(String userPublicId) {
        User user = userRepository.findByPublicId(userPublicId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.getOrderByUser(user)
                .stream()
                .map(OrderDto::new)
                .collect(Collectors.toList());
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
        return new OrderDto(entity);
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
