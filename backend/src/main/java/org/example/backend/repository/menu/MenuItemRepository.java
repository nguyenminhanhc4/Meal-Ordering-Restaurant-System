package org.example.backend.repository.menu;

import org.springframework.data.jpa.repository.JpaRepository;
import org.example.backend.entity.menu.MenuItem;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
}
