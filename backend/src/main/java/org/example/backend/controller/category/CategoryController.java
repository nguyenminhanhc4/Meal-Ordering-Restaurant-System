package org.example.backend.controller.category;

import org.example.backend.dto.category.CategoryDTO;
import org.example.backend.dto.category.CategorySearchRequest;
import org.example.backend.service.category.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    // Create
    @PostMapping
    public CategoryDTO create(@RequestBody CategoryDTO dto) {
        return categoryService.createCategory(dto);
    }

    // Read all
    @GetMapping
    public List<CategoryDTO> getAll() {
        return categoryService.getAllCategories();
    }

    // Read by id
    @GetMapping("/{id}")
    public CategoryDTO getById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    // Update
    @PutMapping("/{id}")
    public CategoryDTO update(@PathVariable Long id, @RequestBody CategoryDTO dto) {
        return categoryService.updateCategory(id, dto);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }

    // Optional: get children of a category
    @GetMapping("/{id}/children")
    public List<CategoryDTO> getChildren(@PathVariable Long id) {
        return categoryService.getChildren(id);
    }

    // API phân trang cơ bản
    @GetMapping("/paginated")
    public Page<CategoryDTO> getAllWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        return categoryService.getAllCategoriesWithPagination(page, size, sortBy, sortDirection);
    }

    // API tìm kiếm và filter với phân trang cho admin
    @PostMapping("/admin/search")
    public Page<CategoryDTO> searchCategoriesForAdmin(
            @RequestBody CategorySearchRequest searchRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return categoryService.searchCategoriesWithPagination(searchRequest, page, size);
    }

    // API tìm kiếm đơn giản qua GET cho admin
    @GetMapping("/admin/search")
    public Page<CategoryDTO> searchCategoriesForAdminSimple(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) Boolean hasParent,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        CategorySearchRequest searchRequest = new CategorySearchRequest();
        searchRequest.setName(name);
        searchRequest.setDescription(description);
        searchRequest.setParentId(parentId);
        searchRequest.setHasParent(hasParent);
        searchRequest.setSortBy(sortBy);
        searchRequest.setSortDirection(sortDirection);
        
        return categoryService.searchCategoriesWithPagination(searchRequest, page, size);
    }
}
