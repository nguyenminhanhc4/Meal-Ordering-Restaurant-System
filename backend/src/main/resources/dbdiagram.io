Table params {
  id bigint [pk, increment]
  type varchar(50) [not null] // ROLE, ORDER_STATUS, GENDER
  code varchar(50) [not null] // ADMIN, CUSTOMER...
  name varchar(100) [not null] // Quản trị, Khách hàng, Nam, Nữ...
  indexes {
    (type, code) [unique]
  }
}

Table users {
  id bigint [pk, increment]
  public_id char(36) [not null, unique]
  name varchar(100) [not null]
  email varchar(100) [not null, unique]
  password_hash varchar(255) [not null]
  avatar_url varchar(255)
  role_id bigint [not null, ref: > params.id]
  gender_id bigint [ref: > params.id]
  status_id bigint [ref: > params.id] // ACTIVE / INACTIVE
  created_at timestamp
  updated_at timestamp
}

Table staff {
  id bigint [pk, increment]
  user_id bigint [not null, unique, ref: > users.id]
  position_id bigint [ref: > params.id]
  salary decimal(12,2)
  avatar_url varchar(255)
}

Table categories {
  id bigint [pk, increment]
  name varchar(100) [unique, not null]
  description text
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  updated_at timestamp [default: `CURRENT_TIMESTAMP`, note: "ON UPDATE CURRENT_TIMESTAMP"]
  parent_id bigint [ref: > categories.id]
}

Table menu_items {
  id bigint [pk, increment]
  name varchar(150) [not null]
  description text
  price decimal(10,2) [not null]
  category_id bigint [ref: > categories.id]
  status_id bigint [ref: > params.id] // AVAILABLE / OUT_OF_STOCK
  avatar_url varchar(255)
  created_at timestamp
  updated_at timestamp
}

Table inventory {
  id bigint [pk, increment]
  menu_item_id bigint [not null, ref: > menu_items.id]
  quantity int [not null]
  last_updated timestamp
}

Table carts {
  id bigint [pk, increment]
  user_id bigint [not null, ref: > users.id]
  status_id bigint [ref: > params.id] // ACTIVE / CHECKED_OUT
  created_at timestamp
  updated_at timestamp
}

Table cart_items {
  id bigint [pk, increment]
  cart_id bigint [not null, ref: > carts.id]
  menu_item_id bigint [not null, ref: > menu_items.id]
  quantity int [not null]
  indexes {
    (cart_id, menu_item_id) [unique]
  }
}

Table orders {
  id bigint [pk, increment]
  public_id char(36) [not null, unique]
  user_id bigint [not null, ref: > users.id]
  status_id bigint [ref: > params.id] // PENDING / PAID / CANCELLED
  total_amount decimal(12,2) [not null]
  created_at timestamp
  updated_at timestamp
}

Table order_items {
  id bigint [pk, increment]
  order_id bigint [not null, ref: > orders.id]
  menu_item_id bigint [not null, ref: > menu_items.id]
  quantity int [not null]
  price decimal(10,2) [not null]
  indexes {
    (order_id, menu_item_id) [unique]
  }
}

Table payments {
  id bigint [pk, increment]
  order_id bigint [not null, unique, ref: > orders.id]
  payment_method_id bigint [ref: > params.id] // CASH / CARD / MOMO
  amount decimal(12,2) [not null]
  status_id bigint [ref: > params.id]
  transaction_id varchar(100)
  created_at timestamp
  updated_at timestamp
}

Table tables {
  id bigint [pk, increment]
  name varchar(50) [not null]
  capacity int [not null]
  status_id bigint [ref: > params.id]
  location_id bigint [ref: > params.id]
  created_at timestamp
  updated_at timestamp
}

Table reservations {
  id bigint [pk, increment]
  public_id char(36) [not null, unique]
  user_id bigint [not null, ref: > users.id]
  reservation_time timestamp [not null]
  status_id bigint [ref: > params.id]
  table_id bigint [ref: > tables.id]
  created_at timestamp
  updated_at timestamp
}

Table reviews {
  id bigint [pk, increment]
  user_id bigint [not null, ref: > users.id]
  menu_item_id bigint [not null, ref: > menu_items.id]
  rating int [not null]
  comment text
  created_at timestamp
  updated_at timestamp
  indexes {
    (user_id, menu_item_id) [unique]
  }
}

Table reports {
  id bigint [pk, increment]
  type varchar(50) [not null]
  content json
  start_date date
  end_date date
  generated_at timestamp
  updated_at timestamp
}

Table ingredients {
  id bigint [pk, increment]
  name varchar(100) [not null]
  quantity int [not null]
  unit varchar(50) // KG, GRAM, LITER
  minimum_stock int
  last_updated timestamp
}

Table menu_item_ingredients {
  id bigint [pk, increment]
  menu_item_id bigint [not null, ref: > menu_items.id]
  ingredient_id bigint [not null, ref: > ingredients.id]
  quantity_needed decimal(10,2) [not null]
  indexes {
    (menu_item_id, ingredient_id) [unique]
  }
}

Table notifications {
  id bigint [pk, increment]
  user_id bigint [not null, ref: > users.id]
  order_id bigint [ref: > orders.id]
  reservation_id bigint [ref: > reservations.id]
  message text [not null]
  type_id bigint [ref: > params.id]
  is_read boolean
  created_at timestamp
}
