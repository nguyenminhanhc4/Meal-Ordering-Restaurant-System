package org.example.backend.config;

import org.example.backend.entity.category.Categories;
import org.example.backend.entity.param.Param;
import org.example.backend.entity.table.TableEntity;
import org.example.backend.entity.user.User;
import org.example.backend.repository.category.CategoryRepository;
import org.example.backend.repository.param.ParamRepository;
import org.example.backend.repository.table.TableRepository;
import org.example.backend.repository.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ParamRepository paramRepository;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoriesRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // must be defined as a bean in Security config

    @Override
    public void run(String... args) {
//        // ==================== STATUS ====================
//        createParamIfNotExists("STATUS_RESERVATION", "CONFIRMED", "Confirmed Reservation", "Đặt bàn đã được xác nhận");
//        createParamIfNotExists("STATUS_RESERVATION", "CANCELLED", "Cancelled Reservation", "Đặt bàn đã bị hủy");
//        createParamIfNotExists("STATUS_RESERVATION", "PENDING", "Pending Reservation", "Đang chờ xác nhận đặt bàn");
//        createParamIfNotExists("STATUS_TABLE", "AVAILABLE", "Available Table", "Bàn trống, có thể đặt");
//        createParamIfNotExists("STATUS_TABLE", "OCCUPIED", "Occupied Table", "Bàn đang có khách");
//
//        // ==================== POSITION ====================
//        createParamIfNotExists("POSITION", "VIP", "VIP Table", "Bàn sang trọng, dành cho khách VIP");
//        createParamIfNotExists("POSITION", "GOOD_VIEW", "Good View Table", "Bàn có view đẹp, gần cửa sổ hoặc sảnh trung tâm");
//        createParamIfNotExists("POSITION", "PERSONAL", "Personal Table", "Bàn riêng, phù hợp cặp đôi hoặc cá nhân");
//        createParamIfNotExists("POSITION", "FAMILY", "Family Table", "Bàn lớn, phục vụ nhóm từ 4-6 người");
//        createParamIfNotExists("POSITION", "BAR", "Bar Table", "Bàn nhỏ, ghế cao, gần quầy bar");
//        createParamIfNotExists("POSITION", "CENTER", "Center Table", "Bàn trung tâm, phù hợp nhóm nhỏ hoặc vừa");
//
//        // ==================== LOCATION ====================
//        createParamIfNotExists("LOCATION", "MAIN_HALL", "Sảnh chính", "Khu vực trung tâm nhà hàng, bàn lớn, ánh sáng tốt");
//        createParamIfNotExists("LOCATION", "OUTDOOR", "Sân vườn", "Không gian ngoài trời, view đẹp, thoáng mát");
//        createParamIfNotExists("LOCATION", "VIP_ROOM", "Phòng VIP", "Phòng riêng, yên tĩnh, phục vụ khách VIP");
//        createParamIfNotExists("LOCATION", "BAR_AREA", "Khu quầy bar", "Khu vực quầy bar, bàn nhỏ, phục vụ đồ uống");
//        createParamIfNotExists("LOCATION", "PRIVATE_ROOM", "Phòng riêng", "Dành cho nhóm nhỏ, riêng tư");
//
//        // ==================== ROLE ====================
//        createParamIfNotExists("ROLE", "CUSTOMER", "Customer", "Khách hàng của nhà hàng");
//        createParamIfNotExists("ROLE", "STAFF", "Staff", "Nhân viên phục vụ, bếp hoặc thu ngân");
//        createParamIfNotExists("ROLE", "ADMIN", "Admin", "Quản trị viên hệ thống");

          // ==================== ORDER_STATUS ====================
        createParamIfNotExists("ORDER_STATUS", "DELIVERED", "Đã xác nhận giao hàng", "Đã xác nhận giao hàng");
        createParamIfNotExists("ORDER_STATUS", "CANCELLED", "Đơn bị hủy", "Đơn bị hủy");
        createParamIfNotExists("ORDER_STATUS", "PENDING", "Đang chờ xác nhận", "Đang chờ xác nhận");
        createParamIfNotExists("ORDER_STATUS", "APPROVED", "Đã xác nhận đơn", "Đã xác nhận đơn");
        createParamIfNotExists("ORDER_STATUS", "DELIVERING", "Đang giao hàng", "Đang giao hàng");
        createParamIfNotExists("STATUS_RESERVATION", "COMPLETED", "Khách trả bản", "Khách trả bản");

        // --- NOTIFICATION TYPES ---
        createParamIfNotExists("NOTIFICATION", "ORDER_NEW", "Đơn hàng mới", "Khi khách hàng tạo đơn hàng mới");
        createParamIfNotExists("NOTIFICATION", "ORDER_APPROVED", "Đơn hàng được duyệt", "Khi nhân viên duyệt đơn hàng");
        createParamIfNotExists("NOTIFICATION", "ORDER_DELIVERING", "Đơn hàng đang giao", "Khi đơn hàng đang giao");
        createParamIfNotExists("NOTIFICATION", "ORDER_DELIVERED", "Đơn hàng đã giao", "Khi giao hàng thành công");
        createParamIfNotExists("NOTIFICATION", "ORDER_CANCELLED", "Đơn hàng bị hủy", "Khi đơn hàng bị hủy");

        createParamIfNotExists("NOTIFICATION", "RESERVATION_NEW", "Đặt bàn mới", "Khi khách hàng đặt bàn mới");
        createParamIfNotExists("NOTIFICATION", "RESERVATION_CONFIRMED", "Đặt bàn được duyệt", "Khi nhân viên duyệt đặt bàn");
        createParamIfNotExists("NOTIFICATION", "RESERVATION_COMPLETED", "Hoàn tất đặt bàn", "Khi khách rời bàn");
        createParamIfNotExists("NOTIFICATION", "RESERVATION_CANCELLED", "Đặt bàn bị hủy", "Khi đặt bàn bị hủy");

        //createCombo();
        createComboCategory();
    }

    private void createComboCategory() {

// Combo
// ├── Combo Availability
// │    ├── Morning Only
// │    ├── Lunch Only
// │    ├── Dinner Only
// │    ├── Weekend Only
// │    ├── Holiday Special
// │    └── New Year Special
// ├── Combo Type
// │    ├── Family Combo
// │    ├── Couple Combo
// │    ├── Party Combo
// │    ├── Student Combo
// │    └── Office Lunch Combo
// └── Combo People
//      ├── Single
//      ├── Couple
//      ├── Family Small
//      ├── Family Large
//      └── Party Pack


        // ====== Top-level Combo category ======
        Categories combo = createCategoryIfNotExists(
                "Combo",
                "Tập hợp các chiến binh 1 nhóm",
                null
        );

        // ====== COMBO AVAILABLE ======
        Categories availableGroup = createCategoryIfNotExists(
                "Combo Availability",
                "Combo availability by time period",
                combo
        );

        createCategoryIfNotExists("Morning Only", "Available from 6:00 AM to 10:30 AM", availableGroup);
        createCategoryIfNotExists("Lunch Only", "Available from 11:00 AM to 2:00 PM", availableGroup);
        createCategoryIfNotExists("Dinner Only", "Available from 5:00 PM to 9:00 PM", availableGroup);
        createCategoryIfNotExists("Weekend Only", "Available on Saturdays and Sundays", availableGroup);
        createCategoryIfNotExists("Holiday Special", "Available during public holidays", availableGroup);
        createCategoryIfNotExists("New Year Special", "Available during New Year festival", availableGroup);

        // ====== COMBO TYPE ======
        Categories typeGroup = createCategoryIfNotExists(
                "Combo Type",
                "Combo type or bundle theme",
                combo
        );

        createCategoryIfNotExists("Family Combo", "Bundle for 4–6 people, family sharing set", typeGroup);
        createCategoryIfNotExists("Couple Combo", "Bundle for 2 people, perfect for dates", typeGroup);
        createCategoryIfNotExists("Party Combo", "Large set for 8–10 people or celebrations", typeGroup);
        createCategoryIfNotExists("Student Combo", "Budget-friendly meal for students", typeGroup);
        createCategoryIfNotExists("Office Lunch Combo", "Quick lunch set for office workers", typeGroup);

        // ====== COMBO PEOPLE ======
        Categories peopleGroup = createCategoryIfNotExists(
                "Combo People",
                "Number of people the combo serves",
                combo
        );

        createCategoryIfNotExists("Single", "Serves 1 person", peopleGroup);
        createCategoryIfNotExists("Couple", "Serves 2 people", peopleGroup);
        createCategoryIfNotExists("Family Small", "Serves around 4 people", peopleGroup);
        createCategoryIfNotExists("Family Large", "Serves around 6 people", peopleGroup);
        createCategoryIfNotExists("Party Pack", "Serves around 10 people", peopleGroup);
    }



    // ==================== TẠO BÀN MẪU ====================
    private void createSampleTables() {
        // Main Hall: CENTER & GOOD_VIEW
        createTablesByLocation("MAIN_HALL", new String[]{"CENTER", "GOOD_VIEW"}, 5);

        // VIP Room: VIP
        createTablesByLocation("VIP_ROOM", new String[]{"VIP"}, 3);

        // Outdoor: CENTER & PERSONAL
        createTablesByLocation("OUTDOOR", new String[]{"CENTER", "PERSONAL"}, 4);

        // Bar Area: BAR
        createTablesByLocation("BAR_AREA", new String[]{"BAR"}, 3);

        // Private Room: PERSONAL & FAMILY
        createTablesByLocation("PRIVATE_ROOM", new String[]{"PERSONAL", "FAMILY"}, 2);

    }

    // ==================== HELPER ====================
    private void createParamIfNotExists(String type, String code, String name, String description) {
        paramRepository.findByTypeAndCode(type, code)
                .orElseGet(() -> {
                    Param param = new Param();
                    param.setType(type);
                    param.setCode(code);
                    param.setName(name);
                    param.setDescription(description); // for UI
                    return paramRepository.save(param);
                });
    }

    private void createTablesByLocation(String locationCode, String[] positionCodes, int tablesPerPosition) {
        Param location = paramRepository.findByTypeAndCode("LOCATION", locationCode)
                .orElseThrow(() -> new RuntimeException("LOCATION " + locationCode + " not seeded"));

        for (String positionCode : positionCodes) {
            Param position = paramRepository.findByTypeAndCode("POSITION", positionCode)
                    .orElseThrow(() -> new RuntimeException("POSITION " + positionCode + " not seeded"));

            int defaultCapacity = switch (positionCode) {
                case "VIP" -> 8;
                case "FAMILY" -> 6;
                case "PERSONAL", "BAR" -> 2;
                case "CENTER", "GOOD_VIEW" -> 4;
                default -> 4;
            };

            for (int i = 1; i <= tablesPerPosition; i++) {
                String tableName = location.getName() + " " + position.getName() + " " + i;
                createTableIfNotExists(tableName, defaultCapacity, locationCode, positionCode);
            }
        }
    }

    private void createTableIfNotExists(String name, int capacity, String locationCode, String positionCode) {
        tableRepository.findByName(name)
                .orElseGet(() -> {
                    Param status = paramRepository.findByTypeAndCode("STATUS_TABLE", "AVAILABLE")
                            .orElseThrow(() -> new RuntimeException("STATUS_TABLE AVAILABLE not seeded"));
                    Param location = paramRepository.findByTypeAndCode("LOCATION", locationCode)
                            .orElseThrow(() -> new RuntimeException("LOCATION " + locationCode + " not seeded"));
                    Param position = paramRepository.findByTypeAndCode("POSITION", positionCode)
                            .orElseThrow(() -> new RuntimeException("POSITION " + positionCode + " not seeded"));

                    TableEntity table = new TableEntity();
                    table.setName(name);
                    table.setCapacity(capacity);
                    table.setStatus(status);
                    table.setLocation(location);
                    table.setPosition(position);
                    return tableRepository.save(table);
                });
    }

//    // ==================== CATEGORY ====================
//    private void createCategoryIfNotExists(String name, String description) {
//        categoriesRepository.findByName(name)
//                .orElseGet(() -> {
//                    Categories category = new Categories();
//                    category.setName(name);
//                    category.setDescription(description);
//                    return categoriesRepository.save(category);
//                });
//    }

    private Categories createCategoryIfNotExists(String name, String description, Categories parent) {
        return categoriesRepository.findByName(name)
                .orElseGet(() -> {
                    Categories category = new Categories();
                    category.setName(name);
                    category.setDescription(description);
                    category.setParent(parent);
                    return categoriesRepository.save(category);
                });
    }

    // ==================== ADMIN ====================
    private void createAdminIfNotExists(String email, String name, String rawPassword) {
        userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setPublicId(UUID.randomUUID().toString());
            user.setName(name);
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            user.setAvatarUrl(null);

            Param adminRole = paramRepository.findByTypeAndCode("ROLE", "ADMIN")
                    .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not seeded"));
            user.setRole(adminRole);

            user.setGender(null);

            Param status = paramRepository.findByTypeAndCode("STATUS", "CONFIRMED")
                    .orElseThrow(() -> new RuntimeException("STATUS CONFIRMED not seeded"));
            user.setStatus(status);

            LocalDateTime now = LocalDateTime.now();
            user.setCreatedAt(now);
            user.setUpdatedAt(now);

            return userRepository.save(user);
        });
    }
}
