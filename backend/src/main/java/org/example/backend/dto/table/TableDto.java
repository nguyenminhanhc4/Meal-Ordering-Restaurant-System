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
    private String shortName;
    private Integer capacity;
    private Long statusId;
    private String statusName;
    private Long locationId;
    private String locationName;
    private Long positionId;
    private String positionName;
    private String locationDescription;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TableDto(TableEntity table) {
        if (table != null) {
            this.id = table.getId();
            this.name = table.getName();
            this.shortName = generateShortName(table.getName());
            this.capacity = table.getCapacity();
            if (table.getStatus() != null) {
                this.statusId = table.getStatus().getId();
                this.statusName = table.getStatus().getCode();
            }
            if (table.getLocation() != null) {
                this.locationId = table.getLocation().getId();
                this.locationName = table.getLocation().getCode();
                this.locationDescription = table.getLocation().getDescription();
            }
            if (table.getPosition() != null){
                this.positionId = table.getPosition().getId();
                this.positionName = table.getPosition().getName();
            }
            this.createdAt = table.getCreatedAt();
            this.updatedAt = table.getUpdatedAt();
        }
    }

    private String generateShortName(String name) {
        if (name == null) return "";
        // Ví dụ: chỉ lấy tối đa 3 ký tự đầu, hoặc chữ cái đầu mỗi từ
        String[] parts = name.split(" ");
        if (parts.length == 1) {
            return parts[0].length() <= 3 ? parts[0] : parts[0].substring(0, 3);
        } else {
            StringBuilder sb = new StringBuilder();
            for (String p : parts) {
                if (!p.isEmpty()) sb.append(p.charAt(0));
            }
            return sb.toString().toUpperCase();
        }
    }
}
