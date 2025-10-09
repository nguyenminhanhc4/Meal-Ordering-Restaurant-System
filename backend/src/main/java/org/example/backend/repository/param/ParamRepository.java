package org.example.backend.repository.param;


import org.example.backend.entity.param.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParamRepository extends JpaRepository<Param, Long> {
    Optional<Param> findByTypeAndCode(String type, String code);
    List<Param> findAllByType(String type);
}
