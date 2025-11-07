package org.example.backend.service.category;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.category.CategoryTreeDTO;
import org.example.backend.entity.category.Categories;
import org.example.backend.repository.category.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryTreeService {
    private final CategoryRepository categoryRepository;

    public List<CategoryTreeDTO> getCategoryTree(Long rootId) {
        List<Categories> allCategories = categoryRepository.findAll();

        // Map id -> DTO
        Map<Long, CategoryTreeDTO> dtoMap = new HashMap<>();
        for (Categories c : allCategories) {
            CategoryTreeDTO dto = new CategoryTreeDTO();
            dto.setId(c.getId());
            dto.setName(c.getName());
            dto.setDescription(c.getDescription());
            dto.setChildren(new ArrayList<>());
            dtoMap.put(c.getId(), dto);
        }

        // Build tree structure
        for (Categories c : allCategories) {
            CategoryTreeDTO dto = dtoMap.get(c.getId());
            if (c.getParent() != null) {
                CategoryTreeDTO parentDto = dtoMap.get(c.getParent().getId());
                if (parentDto != null) {
                    parentDto.getChildren().add(dto);
                }
            }
        }

        // Nếu rootId = null → trả về tất cả root
        if (rootId == null) {
            return allCategories.stream()
                    .filter(c -> c.getParent() == null)
                    .map(c -> dtoMap.get(c.getId()))
                    .collect(Collectors.toList());
        }

        // Nếu có rootId → trả về cây con của root đó
        CategoryTreeDTO rootDto = dtoMap.get(rootId);
        if (rootDto == null) {
            throw new RuntimeException("Category not found with id = " + rootId);
        }

        return List.of(rootDto);
    }

}
