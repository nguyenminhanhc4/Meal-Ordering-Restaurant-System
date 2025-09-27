package org.example.backend.service.inventory;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.inventory.InventoryDto;
import org.example.backend.entity.inventory.Inventory;
import org.example.backend.repository.inventory.InventoryRepository;
import org.example.backend.repository.menu.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final MenuItemRepository menuItemRepository;

    public List<InventoryDto> findAll() {
        return inventoryRepository.findAll()
                .stream().map(InventoryDto::new)
                .collect(Collectors.toList());
    }

    public Optional<InventoryDto> findById(Long id) {
        return inventoryRepository.findById(id).map(InventoryDto::new);
    }

    public InventoryDto save(InventoryDto dto) {
        Inventory entity = toEntity(dto);
        return new InventoryDto(inventoryRepository.save(entity));
    }

    public InventoryDto getById(Long id) {
        return inventoryRepository.findById(id)
                .map(InventoryDto::new)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));
    }

    public InventoryDto updateById(Long id, InventoryDto dto) {
        Inventory entity = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));
        entity.setQuantity(dto.getQuantity());
        entity.setLastUpdated(LocalDateTime.now());
        entity.setMenuItem(menuItemRepository.findById(dto.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("MenuItem not found")));
        return new InventoryDto(inventoryRepository.save(entity));
    }

    public void deleteById(Long id) {
        Inventory entity = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));
        inventoryRepository.delete(entity);
    }

    private Inventory toEntity(InventoryDto dto) {
        Inventory entity = new Inventory();
        entity.setId(dto.getId());
        entity.setQuantity(dto.getQuantity());
        entity.setLastUpdated(LocalDateTime.now());
        entity.setMenuItem(menuItemRepository.findById(dto.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("MenuItem not found")));
        return entity;
    }
}
