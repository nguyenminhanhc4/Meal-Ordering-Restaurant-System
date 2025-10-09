package org.example.backend.service.table;

import lombok.RequiredArgsConstructor;
import org.example.backend.entity.param.Param;
import org.example.backend.repository.param.ParamRepository;
import org.springframework.stereotype.Service;
import org.example.backend.dto.table.TableDto;
import org.example.backend.entity.table.TableEntity;
import org.example.backend.repository.table.TableRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableService {

    private final TableRepository tableRepository;
    private final ParamRepository paramRepository;

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
        // --- Update status ---
        if (dto.getStatusId() != null) {
            Param status = paramRepository.findById(dto.getStatusId())
                    .orElseThrow(() -> new RuntimeException("Status not found"));
            table.setStatus(status);
        }

        // --- Update location ---
        if (dto.getLocationId() != null) {
            Param location = paramRepository.findById(dto.getLocationId())
                    .orElseThrow(() -> new RuntimeException("Location not found"));
            table.setLocation(location);
        }

        if (dto.getPositionId() != null) {
            Param position = paramRepository.findById(dto.getPositionId())
                    .orElseThrow(() -> new RuntimeException("Position not found"));
            table.setPosition(position);
        }
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
        entity.setName(dto.getName());
        entity.setCapacity(dto.getCapacity());
        if (dto.getStatusId() != null) {
            Param status = paramRepository.findById(dto.getStatusId())
                    .orElse(null);
            entity.setStatus(status);
        }
        if (dto.getLocationId() != null) {
            Param location = paramRepository.findById(dto.getLocationId())
                    .orElse(null);
            entity.setLocation(location);
        }
        if (dto.getPositionId() != null){
            Param position = paramRepository.findById(dto.getPositionId()).orElse(null);
            entity.setPosition(position);
        }
        return entity;
    }
}
