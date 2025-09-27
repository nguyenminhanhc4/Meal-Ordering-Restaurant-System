package org.example.backend.repository.menu;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

@DataJpaTest
public class MenuItemRepositoryTest {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Test
    public void testFindAllWithDetails() {
        List<Object[]> results = menuItemRepository.findAllWithDetails();

        for (Object[] result : results) {
            System.out.println("MenuItem: " + result[0]);
            System.out.println("CategoryName: " + result[1]);
            System.out.println("CategorySlug: " + result[2]);
            System.out.println("Status: " + result[3]);
            System.out.println("Rating: " + result[4]);
            System.out.println("Sold: " + result[5]);
            System.out.println("---");
        }
    }
}