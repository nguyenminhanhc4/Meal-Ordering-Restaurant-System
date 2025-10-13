package org.example.backend.dto.category;

import lombok.Data;

@Data
public class CategorySearchRequest {
    private String name;
    private String description;
    private Long parentId;
    private Boolean hasParent; // true: chỉ lấy category có parent, false: chỉ lấy root categories, null: lấy tất cả
    private String sortBy = "id"; // Mặc định sort theo id
    private String sortDirection = "asc"; // asc hoặc desc
}