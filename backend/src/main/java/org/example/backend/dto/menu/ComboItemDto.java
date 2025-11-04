package org.example.backend.dto.menu;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComboItemDto {
    private Long id;
    private String name;
    private Integer quantity;
    private BigDecimal price;
    private String avatarUrl;
    private String category;
}
