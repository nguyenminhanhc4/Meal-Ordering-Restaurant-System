package org.example.backend.dto.menu;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComboRequest {
    private String name;
    private String description;
    private String avatarUrl;
    private BigDecimal price;
    private Long categoryId;
    private Long statusId;
    private List<ComboItemRequest> items;
}
