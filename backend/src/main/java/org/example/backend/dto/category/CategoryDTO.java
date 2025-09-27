package org.example.backend.dto.category;

import lombok.Data;

@Data
public class CategoryDTO {
    private Long id;
    private String name;
    private String description;
    private Long parentId; // ID của parent category
}
