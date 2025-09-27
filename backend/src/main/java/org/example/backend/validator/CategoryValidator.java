package org.example.backend.validator;

import org.example.backend.dto.category.CategoryDTO;
import org.example.backend.exception.ValidationException;
import org.springframework.stereotype.Component;

@Component
public class CategoryValidator {

    public static void validate(CategoryDTO dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new ValidationException("Category name cannot be empty");
        }

        String name = dto.getName().trim();
        if (name.length() < 3 || name.length() > 100) {
            throw new ValidationException("Category name must be between 3 and 100 characters");
        }

        if (!name.matches("^[\\p{L}0-9 _-]+$")) {
            throw new ValidationException("Category name contains invalid characters");
        }

        if (dto.getDescription() != null && dto.getDescription().length() > 255) {
            throw new ValidationException("Description too long (max 255 characters)");
        }

        if (dto.getParentId() != null && dto.getParentId() < 0) {
            throw new ValidationException("Parent ID must be a positive number");
        }
    }
}