package org.example.backend.service.param;

import org.example.backend.dto.param.ParamDTO;
import org.example.backend.entity.param.Param;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.param.ParamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParamService {

    @Autowired
    private ParamRepository paramRepository;

    public List<ParamDTO> getAllParamsByType(String type) {
        List<Param> params = paramRepository.findAllByType(type);
        return params.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ParamDTO getParamById(Long id) {
        Param param = paramRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Param not found with id: " + id));
        return convertToDTO(param);
    }

    public ParamDTO getParamByTypeAndCode(String type, String code) {
        Param param = paramRepository.findByTypeAndCode(type, code)
                .orElseThrow(() -> new ResourceNotFoundException(
                    String.format("Param not found with type: %s and code: %s", type, code)));
        return convertToDTO(param);
    }

    private ParamDTO convertToDTO(Param param) {
        ParamDTO dto = new ParamDTO();
        dto.setId(param.getId());
        dto.setType(param.getType());
        dto.setCode(param.getCode());
        dto.setName(param.getName());
        return dto;
    }
}