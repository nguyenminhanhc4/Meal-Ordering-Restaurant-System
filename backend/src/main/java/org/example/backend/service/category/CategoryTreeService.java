package org.example.backend.service.category;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.category.CategoryTreeDTO;
import org.example.backend.entity.category.Categories;
import org.example.backend.repository.category.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryTreeService {
    private final CategoryRepository categoryRepository;

    public List<CategoryTreeDTO> getCategoryTree() {
        List<Categories> allCategories = categoryRepository.findAll();

        // Map id -> CategoryTreeDTO
        Map<Long, CategoryTreeDTO> dtoMap = new HashMap<>();
        for (Categories c : allCategories) {
            CategoryTreeDTO dto = new CategoryTreeDTO();
            dto.setId(c.getId());
            dto.setName(c.getName());
            dto.setDescription(c.getDescription());
            dtoMap.put(c.getId(), dto);
        }

        // Build tree
        List<CategoryTreeDTO> roots = new ArrayList<>();
        for (Categories c : allCategories) {
            CategoryTreeDTO dto = dtoMap.get(c.getId());
            if (c.getParent() != null) {
                CategoryTreeDTO parentDto = dtoMap.get(c.getParent().getId());
                if (parentDto != null) {
                    parentDto.getChildren().add(dto);
                } else {
                    // Parent không tồn tại trong DB, dữ liệu bị lỗi
                    throw new RuntimeException("Parent category not found for id: " + c.getParent().getId());
                }
            } else {
                roots.add(dto);
            }
        }

        return roots;
    }
}
