package org.example.backend.entity.menu;

import jakarta.persistence.*;
import lombok.*;
import org.example.backend.entity.param.Param;
import org.example.backend.entity.category.Categories;
import org.example.backend.entity.review.Review;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "menu_items")
@Data
@NoArgsConstructor
public class MenuItem {

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
    @JoinColumn(name = "category_id", foreignKey = @ForeignKey(name = "fk_menuitem_category"))
    private Categories category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", foreignKey = @ForeignKey(name = "fk_menuitem_status"))
    private Param status; // AVAILABLE / OUT_OF_STOCK

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "menuItem", fetch = FetchType.LAZY)
    private List<Review> reviews;

    @OneToMany(mappedBy = "menuItem", fetch = FetchType.LAZY)
    private List<MenuItemIngredient> menuItemIngredients;
}
