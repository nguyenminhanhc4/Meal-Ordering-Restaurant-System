package org.example.backend.dto.inventory;

import lombok.*;
import org.example.backend.entity.inventory.Inventory;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryDto {

    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private Integer quantity;
    private LocalDateTime lastUpdated;

    public InventoryDto(Inventory entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.menuItemId = entity.getMenuItem().getId();
            this.menuItemName = entity.getMenuItem().getName();
            this.quantity = entity.getQuantity();
            this.lastUpdated = entity.getLastUpdated();
        }
    }
}
