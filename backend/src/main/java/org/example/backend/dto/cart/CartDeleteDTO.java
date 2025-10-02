package org.example.backend.dto.cart;

import lombok.Data;

import java.util.List;

@Data
public class CartDeleteDTO {
    private Long cartId;        // dùng cho clearCart
    private List<Long> itemIds; // dùng cho delete nhiều item
}
