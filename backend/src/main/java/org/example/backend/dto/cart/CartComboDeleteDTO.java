package org.example.backend.dto.cart;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CartComboDeleteDTO {
    private Long cartId;           // dùng để clear toàn bộ combo trong giỏ
    private List<Long> comboIds;   // dùng để xóa nhiều combo
}
