  CREATE TABLE params (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- Ví dụ: ROLE, ORDER_STATUS, GENDER
  code VARCHAR(50) NOT NULL, -- ADMIN, CUSTOMER, ...
  name VARCHAR(100) NOT NULL, -- Quản trị, Khách hàng, Nam, Nữ...
  UNIQUE(type, code)
  );

-- auto-generated definition
  create table users
  (
      id            bigint auto_increment
          primary key,
      public_id     varchar(36)                         not null,
      name          varchar(100)                        not null,
      email         varchar(100)                        not null,
      phone         varchar(20)                         null,
      address       varchar(255)                        null,
      password_hash varchar(255)                        not null,
      avatar_url    varchar(255)                        null,
      role_id       bigint                              not null,
      gender_id     bigint                              null,
      status_id     bigint                              null,
      created_at    timestamp default CURRENT_TIMESTAMP null,
      updated_at    timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
      constraint email
          unique (email),
      constraint public_id
          unique (public_id),
      constraint users_ibfk_1
          foreign key (role_id) references params (id),
      constraint users_ibfk_2
          foreign key (gender_id) references params (id),
      constraint users_ibfk_3
          foreign key (status_id) references params (id)
  );

  create index gender_id
      on users (gender_id);

  create index idx_users_public_id
      on users (public_id);

  create index role_id
      on users (role_id);

  create index status_id
      on users (status_id);



  CREATE TABLE staff (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       user_id BIGINT NOT NULL UNIQUE,
                       position_id BIGINT, -- tham chiếu params
                       salary DECIMAL(12,2) CHECK (salary >= 0),
                       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                       FOREIGN KEY (position_id) REFERENCES params(id)
);

  create table categories
  (
      id          bigint auto_increment
          primary key,
      name        varchar(100)                        not null,
      description text                                null,
      created_at  timestamp default CURRENT_TIMESTAMP null,
      updated_at  timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
      parent_id   bigint                              null,
      constraint name
          unique (name),
      constraint fk_categories_parent
          foreign key (parent_id) references categories (id)
              on delete set null
  );

CREATE TABLE menu_items (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(150) NOT NULL,
                            description TEXT,
                            price DECIMAL(10,2) NOT NULL,
                            category_id BIGINT,
                            status_id BIGINT, -- AVAILABLE / OUT_OF_STOCK
                            avatar_url VARCHAR(255),
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
                            FOREIGN KEY (status_id) REFERENCES params(id) ON DELETE RESTRICT
);

CREATE TABLE inventory (
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           menu_item_id BIGINT NOT NULL,
                           quantity INT NOT NULL,
                           last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                           FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

CREATE TABLE carts (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       user_id BIGINT NOT NULL,
                       status_id BIGINT, -- ACTIVE / CHECKED_OUT
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
                       FOREIGN KEY (status_id) REFERENCES params(id) ON DELETE RESTRICT
);

CREATE TABLE cart_items (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            cart_id BIGINT NOT NULL,
                            menu_item_id BIGINT NOT NULL,
                            quantity INT NOT NULL,
                            FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
                            FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
                            UNIQUE(cart_id, menu_item_id),
                            CONSTRAINT chk_cart_items_quantity CHECK (quantity > 0)
);

CREATE TABLE orders (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        public_id CHAR(36) NOT NULL UNIQUE,
                        user_id BIGINT NOT NULL,
                        status_id BIGINT, -- PENDING / PAID / CANCELLED
                        total_amount DECIMAL(12,2) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
                        FOREIGN KEY (status_id) REFERENCES params(id) ON DELETE RESTRICT
);

CREATE TABLE order_items (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             order_id BIGINT NOT NULL,
                             menu_item_id BIGINT NOT NULL,
                             quantity INT NOT NULL,
                             price DECIMAL(10,2) NOT NULL,
                             FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                             FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT,
                             UNIQUE(order_id, menu_item_id),
                             CONSTRAINT chk_order_items_quantity CHECK (quantity > 0)
);

CREATE TABLE payments (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          order_id BIGINT NOT NULL UNIQUE,
                          payment_method_id BIGINT, -- CASH / CARD / MOMO / PAYPAL
                          amount DECIMAL(12,2) NOT NULL,
                          status_id BIGINT, -- PENDING / COMPLETED / FAILED
                          transaction_id VARCHAR(100), -- Mã giao dịch từ cổng thanh toán
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                          FOREIGN KEY (payment_method_id) REFERENCES params(id),
                          FOREIGN KEY (status_id) REFERENCES params(id)
);

CREATE TABLE tables (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(50) NOT NULL, -- Tên bàn (VD: Bàn 1, Bàn VIP)
                        capacity INT NOT NULL CHECK (capacity > 0), -- Số ghế
                        status_id BIGINT, -- AVAILABLE / OCCUPIED
                        location_id BIGINT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (status_id) REFERENCES params(id),
                        FOREIGN KEY (location_id) REFERENCES params(id)
);

CREATE TABLE reservations (
                              id BIGINT AUTO_INCREMENT PRIMARY KEY,
                              public_id CHAR(36) NOT NULL UNIQUE,
                              user_id BIGINT NOT NULL,
                              reservation_time TIMESTAMP NOT NULL,
                              status_id BIGINT, -- CONFIRMED / CANCELLED
                              table_id BIGINT,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
                              FOREIGN KEY (status_id) REFERENCES params(id) ON DELETE RESTRICT,
                              FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE RESTRICT
);

CREATE TABLE reviews (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         user_id BIGINT NOT NULL,
                         menu_item_id BIGINT NOT NULL,
                         rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
                         comment TEXT,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
                         FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
                         UNIQUE(user_id, menu_item_id)
);

CREATE TABLE reports (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         type VARCHAR(50) NOT NULL, -- SALES, INVENTORY, ...
                         content JSON, -- Lưu dữ liệu dạng JSON
                         start_date DATE,
                         end_date DATE,
                         generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE ingredients (
                             id BIGINT AUTO_INCREMENT PRIMARY KEY,
                             name VARCHAR(100) NOT NULL,
                             quantity INT NOT NULL,
                             unit VARCHAR(50), -- KG, GRAM, LITER
                             minimum_stock INT CHECK (minimum_stock >= 0),
                             last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE menu_item_ingredients (
                                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                       menu_item_id BIGINT NOT NULL,
                                       ingredient_id BIGINT NOT NULL,
                                       quantity_needed DECIMAL(10,2) NOT NULL, -- Số lượng nguyên liệu cần cho 1 món
                                       FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
                                       FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT,
                                       UNIQUE(menu_item_id, ingredient_id)
);

CREATE TABLE notifications (
                               id BIGINT AUTO_INCREMENT PRIMARY KEY,
                               user_id BIGINT NOT NULL,
                               order_id BIGINT,
                               reservation_id BIGINT,
                               message TEXT NOT NULL,
                               type_id BIGINT,
                               is_read BOOLEAN DEFAULT FALSE,
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                               FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                               FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
                               FOREIGN KEY (type_id) REFERENCES params(id)
);

CREATE INDEX idx_users_public_id ON users(public_id);
CREATE INDEX idx_orders_public_id ON orders(public_id);
CREATE INDEX idx_reservations_public_id ON reservations(public_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_menu_item_id ON cart_items(menu_item_id);