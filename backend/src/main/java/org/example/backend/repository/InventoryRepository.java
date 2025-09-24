package org.example.backend.repository;

import org.example.backend.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByMenuItemId(Long menuItemId);
}
