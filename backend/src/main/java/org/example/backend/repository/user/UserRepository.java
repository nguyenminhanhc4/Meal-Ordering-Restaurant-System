package org.example.backend.repository.user;

import org.example.backend.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPublicId(String publicId);

    @Query("SELECT u FROM User u WHERE u.role.code = :code")
    List<User> findByRoleCode(@Param("code") String code);

    @Query("SELECT u FROM User u WHERE " +
            // Điều kiện tìm kiếm theo keyword (tên HOẶC email)
            "(LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            // Điều kiện lọc theo roleId: nếu :roleId là NULL hoặc 0, thì bỏ qua điều kiện này
            "(:roleId IS NULL OR :roleId = 0 OR u.role.id = :roleId)")
    Page<User> findByKeywordAndRole(@Param("keyword") String keyword, @Param("roleId") Long roleId, Pageable pageable);

    // This method will be used if NO search keyword is provided
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role LEFT JOIN FETCH u.status")
    Page<User> findAll(Pageable pageable);

    // Lazy load: chỉ lấy các field cơ bản, không fetch associations
    @Query("SELECT u FROM User u")
    List<User> findAllUsersLazy();

    boolean existsByEmail(String email);
}
