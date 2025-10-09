package org.example.backend.service.menu;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.menu.MenuItemMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.example.backend.dto.menu.MenuItemDto;
import org.example.backend.entity.category.Categories;
import org.example.backend.entity.menu.MenuItem;
import org.example.backend.repository.category.CategoryRepository;
import org.example.backend.repository.menu.MenuItemRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoriesRepository;
    private final Cloudinary cloudinary;
    private final MenuItemMapper menuItemMapper;

    // --- BASIC CRUD ---
    @Transactional(readOnly = true)
    public Page<MenuItemDto> findAll(int page, int size, String search, String sort, String categorySlug) {
        // 1️⃣ Xác định kiểu sắp xếp
        Sort sortOption = switch (sort.toLowerCase()) {
            case "price-asc" -> Sort.by(Sort.Direction.ASC, "m.price");
            case "price-desc" -> Sort.by(Sort.Direction.DESC, "m.price");
            case "newest" -> Sort.by(Sort.Direction.DESC, "m.createdAt");
            default -> Sort.unsorted(); // "popular" sẽ xử lý logic trong query
        };

        Pageable pageable = PageRequest.of(page, size, sortOption);

        // 2️⃣ Gọi repository phù hợp với bộ lọc
        Page<Object[]> results;

        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasCategory = categorySlug != null && !categorySlug.trim().isEmpty();

        if (hasSearch && hasCategory) {
            results = menuItemRepository.findAllWithDetailsByCategoryAndName(categorySlug, "%" + search.trim() + "%", pageable);
        } else if (hasCategory) {
            results = menuItemRepository.findAllWithDetailsByCategory(categorySlug, pageable);
        } else if (hasSearch) {
            results = menuItemRepository.findAllWithDetailsByNameContainingIgnoreCase("%" + search.trim() + "%", pageable);
        } else {
            results = menuItemRepository.findAllWithDetails(pageable);
        }

        return results.map(this::toMenuItemDto);
    }

    public List<MenuItemDto> findTopPopular(int limit) {
        List<Object[]> results = menuItemRepository.findTopPopular(PageRequest.of(0, limit));
        return results.stream()
                .map(menuItemMapper::toDto)
                .toList();
    }

    private MenuItemDto toMenuItemDto(Object[] result) {
        MenuItem entity = (MenuItem) result[0];
        MenuItemDto dto = new MenuItemDto(entity);
        dto.setCategoryName((String) result[1]);
        dto.setCategorySlug((String) result[2]);
        dto.setStatus((String) result[3]);
        dto.setRating((Double) result[4]);
        dto.setSold(((Number) result[5]).longValue());
        // Nếu có tags, thêm logic ở đây (ví dụ: parse từ cột tags trong menu_items)
        // dto.setTags(Arrays.asList("traditional", "spicy")); // Ví dụ
        return dto;
    }

    public Optional<MenuItemDto> findById(Long id) {
        return menuItemRepository.findById(id)
                .map(MenuItemDto::new);
    }

    public MenuItemDto save(MenuItemDto dto) {
        MenuItem entity = toEntity(dto);
        entity = menuItemRepository.save(entity);
        return new MenuItemDto(entity);
    }

    public void delete(Long id) {
        menuItemRepository.deleteById(id);
    }

    // --- NEW METHODS ---
    public MenuItemDto getById(Long id) {
        MenuItem entity = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MenuItem not found"));
        return new MenuItemDto(entity);
    }

    public MenuItemDto updateById(Long id, MenuItemDto dto) {
        MenuItem entity = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MenuItem not found"));

        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setAvatarUrl(dto.getAvatarUrl());

        if (dto.getCategoryId() != null) {
            Categories category = categoriesRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            entity.setCategory(category);
        }

        entity = menuItemRepository.save(entity);
        return new MenuItemDto(entity);
    }

    public void deleteById(Long id) {
        MenuItem entity = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MenuItem not found"));
        menuItemRepository.delete(entity);
    }

    // --- Conversion helper ---
    private MenuItem toEntity(MenuItemDto dto) {
        MenuItem entity = new MenuItem();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setAvatarUrl(dto.getAvatarUrl());

        if (dto.getCategoryId() != null) {
            Categories category = categoriesRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            entity.setCategory(category);
        }

        return entity;
    }

    

    @Transactional
    public MenuItemDto uploadMenuItemAvatar(Long menuItemId, MultipartFile file) throws IOException {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("MenuItem not found"));

        String url = uploadAvatarToCloudinary(file, "menu");
        menuItem.setAvatarUrl(url);

        menuItemRepository.save(menuItem);
        return new MenuItemDto(menuItem);
    }

    private String uploadAvatarToCloudinary(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) return null;

        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "public_id", fileName,
                        "overwrite", true
                ));

        return uploadResult.get("secure_url").toString();
    }
}
