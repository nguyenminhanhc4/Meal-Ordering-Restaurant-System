package org.example.backend.entity.menu;

import jakarta.persistence.*;
import lombok.*;
import org.example.backend.entity.BaseEntity;
import org.example.backend.entity.category.Categories;
import org.example.backend.entity.param.Param;
import org.example.backend.entity.review.Review;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "menu_item_ingredients")
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
    @JoinColumn(name = "category_id", foreignKey = @ForeignKey(name = "fk_combo_category"))
    private Categories category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", foreignKey = @ForeignKey(name = "fk_combo_status"))
    private Param status; // AVAILABLE / OUT_OF_STOCK

    @Column(name = "avatar_url")
    private String avatarUrl;

    @OneToMany(mappedBy = "combo", fetch = FetchType.LAZY)
    private List<Review> reviews;

    @OneToMany(mappedBy = "combo", fetch = FetchType.LAZY)
    private List<MenuItem> items;
}
