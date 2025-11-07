// src/main/java/org/example/backend/dto/cart/CartComboItemDto.java
package org.example.backend.dto.cart;

import lombok.*;
import org.example.backend.dto.menu.ComboItemDto;
import org.example.backend.entity.cart.CartComboItem;
import org.example.backend.entity.menu.Combo;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CartComboItemDto {

    private Long id;
    private Long comboId;
    private String comboName;
    private String avatarUrl;
    private BigDecimal price; // giá combo
    private Integer quantity;
    private String status;
    private String description;
    private String categoryName;
    private List<ComboItemDto> items; // danh sách món trong combo

    public CartComboItemDto(CartComboItem entity) {
        if (entity != null) {
            Combo combo = entity.getCombo();
            this.id = entity.getId();
            this.comboId = combo.getId();
            this.comboName = combo.getName();
            this.avatarUrl = combo.getAvatarUrl();
            this.price = combo.getPrice();
            this.quantity = entity.getQuantity();
            this.status = combo.getStatus().getCode();
            this.description = combo.getDescription();
            this.categoryName = combo.getCategory() != null ? combo.getCategory().getName() : null;
            this.items = combo.getItems().stream()
                    .map(item -> new ComboItemDto(
                            item.getMenuItem().getId(),
                            item.getMenuItem().getName(),
                            item.getQuantity(),
                            item.getMenuItem().getPrice(),
                            item.getMenuItem().getAvatarUrl(),
                            item.getMenuItem().getCategory().getName()
                    ))
                    .collect(Collectors.toList());
        }
    }
}