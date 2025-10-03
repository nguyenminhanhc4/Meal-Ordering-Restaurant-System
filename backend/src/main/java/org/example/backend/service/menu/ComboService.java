package org.example.backend.service.menu;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.menu.ComboDto;
import org.example.backend.entity.category.Categories;
import org.example.backend.entity.menu.Combo;
import org.example.backend.entity.param.Param;
import org.example.backend.repository.category.CategoryRepository;
import org.example.backend.repository.menu.ComboRepository;
import org.example.backend.repository.param.ParamRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComboService {

    private final ComboRepository comboRepository;
    private final CategoryRepository categoryRepository;
    private final ParamRepository paramRepository;

    public List<ComboDto> findAll() {
        return comboRepository.findAll()
                .stream().map(ComboDto::new)
                .collect(Collectors.toList());
    }

    public Optional<ComboDto> findById(Long id) {
        return comboRepository.findById(id).map(ComboDto::new);
    }

    public ComboDto getById(Long id) {
        return comboRepository.findById(id)
                .map(ComboDto::new)
                .orElseThrow(() -> new RuntimeException("Combo not found"));
    }

    public ComboDto save(ComboDto dto) {
        Combo entity = toEntity(dto);
        return new ComboDto(comboRepository.save(entity));
    }

    public ComboDto updateById(Long id, ComboDto dto) {
        Combo entity = comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found"));

        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setAvatarUrl(dto.getAvatarUrl());

        if (dto.getCategoryId() != null) {
            Categories category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            entity.setCategory(category);
        }

        if (dto.getStatusId() != null) {
            Param status = paramRepository.findById(dto.getStatusId())
                    .orElseThrow(() -> new RuntimeException("Status not found"));
            entity.setStatus(status);
        }

        return new ComboDto(comboRepository.save(entity));
    }

    public void deleteById(Long id) {
        Combo entity = comboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found"));
        comboRepository.delete(entity);
    }

    private Combo toEntity(ComboDto dto) {
        Combo entity = new Combo();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setAvatarUrl(dto.getAvatarUrl());

        if (dto.getCategoryId() != null) {
            entity.setCategory(categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found")));
        }

        if (dto.getStatusId() != null) {
            entity.setStatus(paramRepository.findById(dto.getStatusId())
                    .orElseThrow(() -> new RuntimeException("Status not found")));
        }

        return entity;
    }
}
