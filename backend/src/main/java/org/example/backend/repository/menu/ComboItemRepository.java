package org.example.backend.repository.menu;

import org.example.backend.entity.menu.ComboItem;
import org.example.backend.entity.menu.ComboItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComboItemRepository extends JpaRepository<ComboItem, ComboItemId> {
}
