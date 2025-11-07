package org.example.backend.dto.menu;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComboItemRequest {
    private Long menuItemId;
    private Integer quantity;
}
