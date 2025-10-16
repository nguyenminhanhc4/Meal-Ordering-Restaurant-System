package org.example.backend.repository.menu;

import org.example.backend.entity.menu.MenuItemIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemIngredientRepository extends JpaRepository<MenuItemIngredient, Long> {
    List<MenuItemIngredient> findByMenuItemId(Long menuItemId);
    
    @Modifying
    @Query("DELETE FROM MenuItemIngredient mii WHERE mii.menuItem.id = :menuItemId")
    void deleteByMenuItemId(@Param("menuItemId") Long menuItemId);
}
