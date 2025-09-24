package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.OrderItemDto;
import org.example.backend.entity.OrderItem;
import org.example.backend.repository.MenuItemRepository;
import org.example.backend.repository.OrderItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;

    private final MenuItemRepository menuItemRepository;

    public List<OrderItemDto> findAll() {
        return orderItemRepository.findAll()
                .stream()
                .map(OrderItemDto::new)
                .collect(Collectors.toList());
    }

    public Optional<OrderItemDto> findById(Long id) {
        return orderItemRepository.findById(id).map(OrderItemDto::new);
    }

    public OrderItemDto save(OrderItemDto dto) {
        OrderItem entity = toEntity(dto);
        entity = orderItemRepository.save(entity);
        return new OrderItemDto(entity);
    }

    public OrderItemDto updateById(Long id, OrderItemDto dto) {
        OrderItem entity = orderItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("OrderItem not found"));

        entity.setQuantity(dto.getQuantity());
        entity.setPrice(dto.getPrice());
        entity = orderItemRepository.save(entity);
        return new OrderItemDto(entity);
    }

    public void deleteById(Long id) {
        OrderItem entity = orderItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("OrderItem not found"));
        orderItemRepository.delete(entity);
    }

    private OrderItem toEntity(OrderItemDto dto) {
        OrderItem entity = new OrderItem();
        entity.setId(dto.getId());
        entity.setQuantity(dto.getQuantity());
        entity.setPrice(dto.getPrice());
        entity.setMenuItem(menuItemRepository.getById(dto.getMenuItemId()));
        return entity;
    }
}
