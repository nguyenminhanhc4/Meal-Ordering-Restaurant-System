// src/main/java/org/example/backend/entity/cart/CartComboItem.java
package org.example.backend.entity.cart;

import jakarta.persistence.*;
import lombok.*;
import org.example.backend.entity.menu.Combo;

@Entity
@Table(name = "cart_combo_items", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"cart_id", "combo_id"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class CartComboItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "combo_id", nullable = false)
    private Combo combo;

    @Column(nullable = false)
    private Integer quantity;
}