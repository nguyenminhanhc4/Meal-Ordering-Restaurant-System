package org.example.backend.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class CategoryTreeDTO {
    private Long id;
    private String name;
    private String description;
    private List<CategoryTreeDTO> children = new ArrayList<>();
}
