package org.example.backend.entity.menu;

import jakarta.persistence.*;
import lombok.*;
import org.example.backend.entity.BaseEntity;
import org.example.backend.entity.category.Categories;
import org.example.backend.entity.param.Param;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "combos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Combo extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Categories category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private Param status; // AVAILABLE / OUT_OF_STOCK

    @Column(name = "avatar_url")
    private String avatarUrl;

    @ManyToMany
    @JoinTable(
            name = "combo_items",
            joinColumns = @JoinColumn(name = "combo_id"),
            inverseJoinColumns = @JoinColumn(name = "menu_item_id")
    )
    private List<MenuItem> items;
}
