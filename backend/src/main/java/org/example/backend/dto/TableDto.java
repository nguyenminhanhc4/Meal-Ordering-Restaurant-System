package org.example.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.entity.TableEntity;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class TableDto {
    private Long id;
    private String name;
    private Integer capacity;
    private Long statusId;
    private Long locationId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TableDto(TableEntity table) {
        if (table != null) {
            this.id = table.getId();
            this.name = table.getName();
            this.capacity = table.getCapacity();
            this.statusId = table.getStatusId();
            this.locationId = table.getLocationId();
            this.createdAt = table.getCreatedAt();
            this.updatedAt = table.getUpdatedAt();
        }
    }
}
