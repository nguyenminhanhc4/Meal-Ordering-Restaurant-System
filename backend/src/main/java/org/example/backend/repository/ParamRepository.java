package org.example.backend.repository;


import org.example.backend.entity.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ParamRepository extends JpaRepository<Param, Long> {
    Optional<Param> findByTypeAndCode(String type, String code);
}
