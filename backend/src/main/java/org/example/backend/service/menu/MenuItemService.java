package org.example.backend.service.menu;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.menu.MenuItemMapper;
import org.example.backend.dto.review.ReviewDto;
import org.example.backend.entity.review.Review;
import org.example.backend.repository.review.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.example.backend.dto.menu.MenuItemDto;
import org.example.backend.dto.menu.MenuItemCreateDTO;
import org.example.backend.dto.menu.MenuItemUpdateDTO;
import org.example.backend.dto.menu.MenuItemSearchRequest;
import org.example.backend.entity.category.Categories;
import org.example.backend.entity.ingredient.Ingredient;
import org.example.backend.entity.inventory.Inventory;
import org.example.backend.entity.menu.MenuItem;
import org.example.backend.entity.menu.MenuItemIngredient;
import org.example.backend.entity.param.Param;
import org.example.backend.repository.category.CategoryRepository;
import org.example.backend.repository.ingredient.IngredientRepository;
import org.example.backend.repository.inventory.InventoryRepository;
import org.example.backend.repository.menu.MenuItemRepository;
import org.example.backend.repository.menu.MenuItemIngredientRepository;
import org.example.backend.repository.param.ParamRepository;
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
    private final ParamRepository paramRepository;
    private final IngredientRepository ingredientRepository;
    private final MenuItemIngredientRepository menuItemIngredientRepository;
    private final InventoryRepository inventoryRepository;
    private final ReviewRepository reviewRepository;
    private final Cloudinary cloudinary;
    private final MenuItemMapper menuItemMapper;

    // --- BASIC CRUD ---
    @Transactional(readOnly = true)
    public Page<MenuItemDto> findAll(int page, int size, String search, String sort, String categorySlug) {
        // 1️⃣ Xác định kiểu sắp xếp
        Sort sortOption;
        String sortLower = sort.toLowerCase();
        if ("price-asc".equals(sortLower)) {
            sortOption = Sort.by(Sort.Direction.ASC, "m.price");
        } else if ("price-desc".equals(sortLower)) {
            sortOption = Sort.by(Sort.Direction.DESC, "m.price");
        } else if ("newest".equals(sortLower)) {
            sortOption = Sort.by(Sort.Direction.DESC, "m.createdAt");
        } else {
            sortOption = Sort.unsorted(); // "popular" sẽ xử lý logic trong query
        }

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
                .collect(Collectors.toList());
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

    public MenuItemDto getById(Long id, Integer reviewPage, Integer reviewSize) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Menu item not found"));

        MenuItemDto dto = new MenuItemDto(menuItem);

        // Nếu người dùng truyền vào param phân trang review
        if (reviewPage != null && reviewSize != null) {
            Pageable pageable = PageRequest.of(reviewPage, reviewSize, Sort.by("createdAt").descending());
            Page<Review> reviewPageResult = reviewRepository.findByMenuItemId(id, pageable);

            List<ReviewDto> reviewDtos = reviewPageResult.getContent()
                    .stream()
                    .map(ReviewDto::new) // convert từng Review -> ReviewDto
                    .collect(Collectors.toList());

            dto.setReviews(reviewDtos);
            dto.setTotalReviews(reviewPageResult.getTotalElements());
            dto.setReviewPages(reviewPageResult.getTotalPages());
            dto.setCurrentReviewPage(reviewPageResult.getNumber());

        }

        return dto;
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

    @Transactional
    public void deleteById(Long id) {
        try {
            // Check if MenuItem exists first
            MenuItem entity = menuItemRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("MenuItem not found with id: " + id));

            System.out.println("🔍 Found MenuItem with id: " + id + ", name: " + entity.getName());

            // Check if menu item is being used in cart_items (RESTRICT constraint)
            Long cartItemsCount = menuItemRepository.countMenuItemInCartItems(id);
            System.out.println("📊 Cart items count: " + cartItemsCount);
            if (cartItemsCount > 0) {
                throw new RuntimeException("Cannot delete menu item because it's currently in " + cartItemsCount + " shopping cart(s). Please remove it from carts first.");
            }

            // Check if menu item is being used in order_items (RESTRICT constraint) 
            Long orderItemsCount = menuItemRepository.countMenuItemInOrderItems(id);
            System.out.println("📊 Order items count: " + orderItemsCount);
            if (orderItemsCount > 0) {
                throw new RuntimeException("Cannot delete menu item because it has been ordered " + orderItemsCount + " time(s). Menu items with order history cannot be deleted.");
            }

            // If we reach here, it's safe to delete
            // The following will be deleted automatically due to CASCADE configuration:
            // - inventory (CASCADE ALL with orphanRemoval)
            // - reviews (CASCADE ALL with orphanRemoval) 
            // - menu_item_ingredients (CASCADE ALL with orphanRemoval)
            
            System.out.println("✅ No foreign key constraints found. Proceeding with delete...");
            menuItemRepository.deleteById(id);
            System.out.println("🎉 Successfully deleted MenuItem with id: " + id);
            
        } catch (Exception e) {
            System.err.println("❌ Error deleting MenuItem with id " + id + ": " + e.getMessage());
            e.printStackTrace();
            
            if (e instanceof RuntimeException) {
                throw e; // Re-throw our custom exceptions
            } else if (e.getMessage().contains("foreign key") || e.getMessage().contains("constraint")) {
                throw new RuntimeException("Database relationship error. Please try again or contact administrator.");
            } else {
                throw new RuntimeException("Failed to delete menu item: " + e.getMessage());
            }
        }
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

    // Public method for standalone image upload
    public String uploadImageToCloudinary(MultipartFile file, String folder) throws IOException {
        return uploadAvatarToCloudinary(file, folder);
    }

    // ===========================================
    // ADMIN Methods for MenuItem Management
    // ===========================================

    @Transactional(readOnly = true)
    public Page<MenuItemDto> findAllForAdmin(int page, int size, String sortBy, String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Object[]> results = menuItemRepository.findAllWithDetails(pageable);
        return results.map(this::toMenuItemDto);
    }

    @Transactional(readOnly = true)
    public Page<MenuItemDto> searchMenuItemsWithPagination(MenuItemSearchRequest searchRequest, int page, int size) {
        Sort.Direction direction = searchRequest.getSortDirection().equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, searchRequest.getSortBy());
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Call repository method with search criteria (need to implement this)
        Page<Object[]> results = menuItemRepository.searchMenuItemsWithFilters(
                searchRequest.getName(),
                searchRequest.getDescription(),
                searchRequest.getCategoryId(),
                searchRequest.getStatusId(),
                searchRequest.getMinPrice(),
                searchRequest.getMaxPrice(),
                pageable
        );
        
        return results.map(this::toMenuItemDto);
    }

    @Transactional
    public MenuItemDto createMenuItem(MenuItemCreateDTO dto) {
        // 1. Create MenuItem entity
        MenuItem menuItem = new MenuItem();
        menuItem.setName(dto.getName());
        menuItem.setDescription(dto.getDescription());
        menuItem.setPrice(dto.getPrice());
        menuItem.setAvatarUrl(dto.getAvatarUrl());

        // 2. Set Category
        Categories category = categoriesRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        menuItem.setCategory(category);

        // 3. Set Status (Param)
        Param status = paramRepository.findById(dto.getStatusId())
                .orElseThrow(() -> new RuntimeException("Status not found"));
        menuItem.setStatus(status);

        // 4. Save MenuItem first
        menuItem = menuItemRepository.save(menuItem);

        // 5. Create Inventory if quantity provided
        if (dto.getAvailableQuantity() != null) {
            Inventory inventory = new Inventory();
            inventory.setMenuItem(menuItem);
            inventory.setQuantity(dto.getAvailableQuantity());
            inventoryRepository.save(inventory);
        }

        // 6. Handle ingredients
        if (dto.getIngredients() != null && !dto.getIngredients().isEmpty()) {
            for (MenuItemCreateDTO.MenuItemIngredientCreateDTO ingredientDto : dto.getIngredients()) {
                Ingredient ingredient = ingredientRepository.findById(ingredientDto.getIngredientId())
                        .orElseThrow(() -> new RuntimeException("Ingredient not found: " + ingredientDto.getIngredientId()));
                
                MenuItemIngredient menuItemIngredient = MenuItemIngredient.builder()
                        .menuItem(menuItem)
                        .ingredient(ingredient)
                        .quantityNeeded(ingredientDto.getQuantityNeeded())
                        .build();
                
                menuItemIngredientRepository.save(menuItemIngredient);
            }
        }

        return new MenuItemDto(menuItem);
    }

    @Transactional
    public MenuItemDto updateMenuItem(Long id, MenuItemUpdateDTO dto) {
        // 1. Get existing MenuItem
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MenuItem not found"));

        // 2. Update basic fields
        menuItem.setName(dto.getName());
        menuItem.setDescription(dto.getDescription());
        menuItem.setPrice(dto.getPrice());
        menuItem.setAvatarUrl(dto.getAvatarUrl());

        // 3. Update Category
        Categories category = categoriesRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        menuItem.setCategory(category);

        // 4. Update Status
        Param status = paramRepository.findById(dto.getStatusId())
                .orElseThrow(() -> new RuntimeException("Status not found"));
        menuItem.setStatus(status);

        // 5. Update Inventory quantity
        if (dto.getAvailableQuantity() != null) {
            Inventory inventory = menuItem.getInventory();
            if (inventory != null) {
                inventory.setQuantity(dto.getAvailableQuantity());
                inventoryRepository.save(inventory);
            } else {
                // Create new inventory if not exists
                inventory = new Inventory();
                inventory.setMenuItem(menuItem);
                inventory.setQuantity(dto.getAvailableQuantity());
                inventoryRepository.save(inventory);
            }
        }

        // 6. Handle ingredients update
        if (dto.getIngredients() != null) {
            System.out.println("🔄 Updating ingredients for MenuItem ID: " + id);
            
            // Use @Modifying query to ensure proper deletion
            System.out.println("🗑️ Deleting existing ingredients for MenuItem ID: " + id);
            menuItemIngredientRepository.deleteByMenuItemId(id);
            
            // Force flush to ensure deletion is committed
            menuItemIngredientRepository.flush();
            System.out.println("✅ Completed deletion");
            
            System.out.println("➕ Adding " + dto.getIngredients().size() + " new ingredients");
            // Add new ingredients
            for (MenuItemUpdateDTO.MenuItemIngredientUpdateDTO ingredientDto : dto.getIngredients()) {
                Ingredient ingredient = ingredientRepository.findById(ingredientDto.getIngredientId())
                        .orElseThrow(() -> new RuntimeException("Ingredient not found: " + ingredientDto.getIngredientId()));
                
                MenuItemIngredient menuItemIngredient = MenuItemIngredient.builder()
                        .menuItem(menuItem)
                        .ingredient(ingredient)
                        .quantityNeeded(ingredientDto.getQuantityNeeded())
                        .build();
                
                System.out.println("💾 Saving new ingredient: MenuItem=" + id + ", Ingredient=" + ingredient.getId() + ", Quantity=" + ingredientDto.getQuantityNeeded());
                menuItemIngredientRepository.save(menuItemIngredient);
            }
            
            System.out.println("✅ Completed adding " + dto.getIngredients().size() + " new ingredients");
        }

        // 7. Save MenuItem
        menuItem = menuItemRepository.save(menuItem);
        
        return new MenuItemDto(menuItem);
    }
}
