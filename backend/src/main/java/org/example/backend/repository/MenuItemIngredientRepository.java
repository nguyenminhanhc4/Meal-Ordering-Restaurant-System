package org.example.backend.repository;

import org.example.backend.entity.MenuItemIngredient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemIngredientRepository extends JpaRepository<MenuItemIngredient, Long> {
}
