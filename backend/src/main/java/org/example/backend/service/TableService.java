package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.example.backend.dto.TableDto;
import org.example.backend.entity.TableEntity;
import org.example.backend.repository.TableRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableService {

    private final TableRepository tableRepository;

    public List<TableDto> findAll() {
        return tableRepository.findAll()
                .stream()
                .map(TableDto::new)
                .collect(Collectors.toList());
    }

    public Optional<TableDto> findById(Long id) {
        return tableRepository.findById(id)
                .map(TableDto::new);
    }

    public TableDto save(TableDto dto) {
        TableEntity table = toEntity(dto);
        table = tableRepository.save(table);
        return new TableDto(table);
    }

    public void delete(Long id) {
        tableRepository.deleteById(id);
    }

    // --- NEW METHODS ---
    public TableDto getById(Long id) {
        TableEntity table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TableEntity not found"));
        return new TableDto(table);
    }

    public TableDto updateById(Long id, TableDto dto) {
        TableEntity table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TableEntity not found"));

        table.setName(dto.getName());
        table.setCapacity(dto.getCapacity());
        table.setStatusId(dto.getStatusId());

        table = tableRepository.save(table);
        return new TableDto(table);
    }

    public void deleteById(Long id) {
        TableEntity table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TableEntity not found"));
        tableRepository.delete(table);
    }

    // Conversion helper
    private TableEntity toEntity(TableDto dto) {
        TableEntity entity = new TableEntity();
        entity.setId(dto.getId());
        entity.setLocationId(dto.getLocationId());
        entity.setName(dto.getName());
        entity.setCapacity(dto.getCapacity());
        entity.setStatusId(dto.getStatusId());
        return entity;
    }
}
