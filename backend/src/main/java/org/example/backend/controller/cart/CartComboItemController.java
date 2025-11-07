// CartComboItemController.java
package org.example.backend.controller.cart;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.Response;
import org.example.backend.dto.cart.AddComboRequest;
import org.example.backend.dto.cart.CartComboDeleteDTO;
import org.example.backend.dto.cart.CartComboItemDto;
import org.example.backend.service.cart.CartComboItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/cart-combos")
public class CartComboItemController {

    private final CartComboItemService service;

    @PostMapping("/{cartId}/items")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addCombo(
            @PathVariable Long cartId,
            @Valid @RequestBody AddComboRequest request) {
        CartComboItemDto saved = service.save(cartId, request.comboId(), request.quantity());
        return ResponseEntity.ok(new Response<>("success", saved, "Đã thêm combo vào giỏ hàng"));
    }

    @GetMapping("/{cartId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getByCart(@PathVariable Long cartId) {
        List<CartComboItemDto> items = service.findByCartId(cartId);
        return ResponseEntity.ok(new Response<>("success", items, "Lấy danh sách combo thành công"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateQuantity(
            @PathVariable Long id,
            @RequestBody CartComboItemDto dto
    ) {
        CartComboItemDto updated = service.updateQuantity(id, dto.getQuantity());
        return ResponseEntity.ok(new Response<>("success", updated, "Cập nhật số lượng combo thành công"));
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<?> deleteCombos(@RequestBody CartComboDeleteDTO request) {
        if (request.getComboIds() != null && !request.getComboIds().isEmpty()) {
            service.deleteByIds(request.getComboIds());
            return ResponseEntity.ok(new Response<>("success", null, "Xóa nhiều combo thành công"));
        } else if (request.getCartId() != null) {
            service.clearCombos(request.getCartId());
            return ResponseEntity.ok(new Response<>("success", null, "Đã xóa toàn bộ combo trong giỏ"));
        }
        return ResponseEntity.badRequest()
                .body(new Response<>("error", null, "Thiếu thông tin để xóa combo"));
    }
}