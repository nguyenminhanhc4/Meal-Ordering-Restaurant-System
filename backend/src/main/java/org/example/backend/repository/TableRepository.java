package org.example.backend.repository;

import org.example.backend.entity.TableEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TableRepository extends JpaRepository<TableEntity, Long> {

    // Find table by unique name (e.g., "Table 1", "VIP Table")
    Optional<TableEntity> findByName(String name);

    // Find all tables by status (AVAILABLE, OCCUPIED, etc.)
    List<TableEntity> findByStatusId(Long statusId);

    // Find all tables by location (e.g., indoor, outdoor, VIP area)
    List<TableEntity> findByLocationId(Long locationId);
}
