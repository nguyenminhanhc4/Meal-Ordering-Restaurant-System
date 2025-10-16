package org.example.backend.repository.inventory;

import org.example.backend.entity.inventory.Inventory;
import org.example.backend.entity.menu.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByMenuItemId(Long menuItemId);

    Optional<Inventory> findByMenuItem(MenuItem menuItem);
}
