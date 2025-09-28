package org.example.backend.repository.order;

<<<<<<< HEAD:backend/src/main/java/org/example/backend/repository/order/OrderRepository.java
import org.example.backend.entity.order.Order;
=======
import org.example.backend.entity.Order;
import org.example.backend.entity.User;
>>>>>>> long:backend/src/main/java/org/example/backend/repository/OrderRepository.java
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByPublicId(String publicId);

    List<Order> getOrderByUser(User user);
}
