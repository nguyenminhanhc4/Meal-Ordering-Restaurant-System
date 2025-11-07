package org.example.backend.dto.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request body để thêm combo vào giỏ hàng
 * POST /api/v1/cart-combos/{cartId}/items
 */
public record AddComboRequest(
        @NotNull(message = "comboId không được để trống")
        Long comboId,

        @NotNull(message = "quantity không được để trống")
        @Min(value = 1, message = "Số lượng phải lớn hơn 0")
        Integer quantity
) {
}