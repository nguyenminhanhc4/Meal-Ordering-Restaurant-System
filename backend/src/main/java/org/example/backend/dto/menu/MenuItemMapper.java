package org.example.backend.dto.menu;

import org.example.backend.entity.menu.MenuItem;
import org.springframework.stereotype.Component;

@Component
public class MenuItemMapper {

    public MenuItemDto toDto(Object[] obj) {
        MenuItem menuItem = (MenuItem) obj[0];

        MenuItemDto dto = new MenuItemDto(menuItem);

        dto.setRating((Double) obj[4]);
        dto.setSold((Long) obj[5]);
        dto.setCategoryName((String) obj[1]);
        dto.setCategorySlug((String) obj[2]);
        dto.setStatus((String) obj[3]);

        return dto;
    }
}
