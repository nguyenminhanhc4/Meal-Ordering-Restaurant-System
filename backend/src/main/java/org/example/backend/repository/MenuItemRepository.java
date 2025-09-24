package org.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.example.backend.entity.MenuItem;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
}
