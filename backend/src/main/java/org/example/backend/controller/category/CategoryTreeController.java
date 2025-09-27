package org.example.backend.controller.category;

import org.example.backend.dto.category.CategoryTreeDTO;
import org.example.backend.service.category.CategoryTreeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories/tree")
public class CategoryTreeController {

    private final CategoryTreeService categoryTreeService;

    public CategoryTreeController(CategoryTreeService categoryTreeService) {
        this.categoryTreeService = categoryTreeService;
    }

    @GetMapping
    public List<CategoryTreeDTO> getTree() {
        return categoryTreeService.getCategoryTree();
    }
}