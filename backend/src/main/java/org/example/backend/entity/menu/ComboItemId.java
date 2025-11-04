package org.example.backend.entity.menu;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ComboItemId implements Serializable {
    private Long comboId;
    private Long menuItemId;
}
