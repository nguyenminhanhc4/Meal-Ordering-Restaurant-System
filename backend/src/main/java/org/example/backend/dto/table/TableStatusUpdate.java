package org.example.backend.dto.table;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TableStatusUpdate {
    private Long tableId;
    private Long statusId;
}
