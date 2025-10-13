package org.example.backend.service.category;

import jakarta.transaction.Transactional;
import org.example.backend.dto.category.CategoryDTO;
import org.example.backend.dto.category.CategorySearchRequest;
import org.example.backend.entity.category.Categories;
import org.example.backend.exception.ValidationException;
import org.example.backend.validator.CategoryValidator;
import org.example.backend.repository.category.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // Convert Entity -> DTO
    private CategoryDTO toDTO(Categories category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setParentId(category.getParent() != null ? category.getParent().getId() : null);
        return dto;
    }

    // Check vòng lặp
    private boolean hasCycle(Categories category, Categories newParent) {
        Categories current = newParent;
        while (current != null) {
            if (current.getId().equals(category.getId())) {
                return true;
            }
            current = current.getParent();
        }
        return false;
    }

    // Convert DTO -> Entity (dùng khi create/update)
    private void updateEntity(Categories category, CategoryDTO dto) {
        CategoryValidator.validate(dto);
        // Validate name unique
        categoryRepository.findByName(dto.getName())
                .filter(c -> !c.getId().equals(category.getId()))
                .ifPresent(c -> { throw new ValidationException("Category name already exists"); });

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        if (dto.getParentId() != null) {
            Categories parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ValidationException("Parent category not found"));

            // Validate vòng lặp
            if (hasCycle(category, parent)) {
                throw new ValidationException("Cannot set parent: would create cycle");
            }

            category.setParent(parent);
        } else {
            category.setParent(null);
        }
    }

    // Create
    public CategoryDTO createCategory(CategoryDTO dto) {
        CategoryValidator.validate(dto);

        Categories category = new Categories();
        updateEntity(category, dto);
        return toDTO(categoryRepository.save(category));
    }

    // Read all
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Read by id
    public CategoryDTO getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ValidationException("Category not found"));
    }

    // Update
    public CategoryDTO updateCategory(Long id, CategoryDTO dto) {
        Categories category = categoryRepository.findById(id)
                .orElseThrow(() -> new ValidationException("Category not found"));
        updateEntity(category, dto);
        return toDTO(categoryRepository.save(category));
    }

    // Delete
    public void deleteCategory(Long id) {
        Categories category = categoryRepository.findById(id)
                .orElseThrow(() -> new ValidationException("Category not found"));
        categoryRepository.delete(category);
    }

    // Get children by parentId
    public List<CategoryDTO> getChildren(Long parentId) {
        return categoryRepository.findByParentId(parentId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Phân trang cơ bản
    public Page<CategoryDTO> getAllCategoriesWithPagination(int page, int size, String sortBy, String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        return categoryRepository.findAll(pageable)
                .map(this::toDTO);
    }

    // Tìm kiếm và filter với phân trang
    public Page<CategoryDTO> searchCategoriesWithPagination(CategorySearchRequest searchRequest, int page, int size) {
        String sortBy = searchRequest.getSortBy() != null ? searchRequest.getSortBy() : "id";
        String sortDirection = searchRequest.getSortDirection() != null ? searchRequest.getSortDirection() : "asc";
        
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        return categoryRepository.findCategoriesWithFilters(
                searchRequest.getName(),
                searchRequest.getDescription(),
                searchRequest.getParentId(),
                searchRequest.getHasParent(),
                pageable
        ).map(this::toDTO);
    }
}
