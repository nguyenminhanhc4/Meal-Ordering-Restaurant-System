package org.example.backend.dto.table;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.entity.table.TableEntity;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class TableDto {
    private Long id;
    private String name;
    private Integer capacity;
    private Long statusId;
    private String statusName;
    private Long locationId;
    private String locationName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TableDto(TableEntity table) {
        if (table != null) {
            this.id = table.getId();
            this.name = table.getName();
            this.capacity = table.getCapacity();
            if (table.getStatus() != null) {
                this.statusId = table.getStatus().getId();
                this.statusName = table.getStatus().getName();
            }
            if (table.getLocation() != null) {
                this.locationId = table.getLocation().getId();
                this.locationName = table.getLocation().getName();
            }
            this.createdAt = table.getCreatedAt();
            this.updatedAt = table.getUpdatedAt();
        }
    }
}
