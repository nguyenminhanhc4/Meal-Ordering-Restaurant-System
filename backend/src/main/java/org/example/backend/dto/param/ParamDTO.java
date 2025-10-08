package org.example.backend.dto.param;

import lombok.Data;
import org.example.backend.entity.param.Param;

@Data
public class ParamDTO {
    private Long id;
    private String type;
    private String code;
    private String name;
    private String description;

    public ParamDTO() {}

    public ParamDTO(Param entity) {
        if (entity != null) {
            this.id = entity.getId();
            this.type = entity.getType();
            this.code = entity.getCode();
            this.name = entity.getName();
            this.description = entity.getDescription();
        }
    }

    // Convert DTO to Entity
    public Param toEntity() {
        Param param = new Param();
        param.setId(this.id);
        param.setType(this.type);
        param.setCode(this.code);
        param.setName(this.name);
        param.setDescription(this.description);
        return param;
    }
}