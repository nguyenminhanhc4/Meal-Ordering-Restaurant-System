package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.OrderDto;
import org.example.backend.entity.Order;
import org.example.backend.entity.User;
import org.example.backend.repository.OrderRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
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

    public OrderDto save(OrderDto dto) {
        Order entity = toEntity(dto);
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

    public void deleteById(Long id) {
        Order entity = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        orderRepository.delete(entity);
    }

    private Order toEntity(OrderDto dto) {
        Order entity = new Order();
        entity.setId(dto.getId());
        entity.setPublicId(dto.getPublicId());
        entity.setTotalAmount(dto.getTotalAmount());
        entity.setUser(userRepository.getById(dto.getUserId()));
        return entity;
    }

    private User getUserById(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<OrderDto> findAllOrderByUserId(Long id) {
        return orderRepository.getOrderByUser(getUserById(id))
                .stream().map(OrderDto::new).collect(Collectors.toList());

    }

    public OrderDto addOrderByUserId(Long id, OrderDto dto) {
        User user = getUserById(id);
        Order entity = toEntity(dto);
        entity.setUser(user);
        orderRepository.save(entity);
        return new OrderDto(entity);
    }
}
