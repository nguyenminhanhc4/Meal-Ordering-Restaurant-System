package org.example.backend.dto.menu;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class ComboDto {
    private Long id;
    private String name;
    private String description;
    private String avatarUrl;
    private BigDecimal price;
    private String category;
    private String status;
    private List<ComboItemDto> items;
}
