package org.example.backend.controller.category;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.category.CategoryTreeDTO;
import org.example.backend.service.category.CategoryTreeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/categories/tree")
public class CategoryTreeController {

    private final CategoryTreeService categoryTreeService;

    @GetMapping
    public List<CategoryTreeDTO> getTree() {
        return categoryTreeService.getCategoryTree(null);
    }

    @GetMapping("/{id}/tree")
    public List<CategoryTreeDTO> getTreeByRoot(@PathVariable Long id) {
        return categoryTreeService.getCategoryTree(id);
    }
}