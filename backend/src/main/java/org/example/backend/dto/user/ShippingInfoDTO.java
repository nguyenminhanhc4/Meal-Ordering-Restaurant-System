package org.example.backend.dto.user;

import lombok.Data;
import org.example.backend.entity.user.ShippingInfo;

@Data
public class ShippingInfoDTO {
    private Long id;
    private Long paymentId;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String note;

    public ShippingInfoDTO(ShippingInfo entity) {
        this.id = entity.getId();
        this.paymentId = entity.getPayment().getId();
        this.fullName = entity.getFullName();
        this.email = entity.getEmail();
        this.phone = entity.getPhone();
        this.address = entity.getAddress();
        this.note = entity.getNote();
    }
}
