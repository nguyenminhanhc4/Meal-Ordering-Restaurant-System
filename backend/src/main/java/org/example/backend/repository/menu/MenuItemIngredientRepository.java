package org.example.backend.repository.menu;

import org.example.backend.entity.menu.MenuItemIngredient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemIngredientRepository extends JpaRepository<MenuItemIngredient, Long> {
}
