package org.example.backend.dto.user;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String publicId;
    private String name;
    private String email;
    private String password;
    private String avatarUrl;
    private Long roleId;
    private String gender;
    private Long statusId;
}
