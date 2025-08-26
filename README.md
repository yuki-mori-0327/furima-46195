## users テーブル

| Column             | Type   | Options                       |
|--------------------|--------|-------------------------------|
| nickname           | string | null: false                   |
| email              | string | null: false, unique: true     |
| encrypted_password | string | null: false                   |
| last_name          | string | null: false                   |
| first_name         | string | null: false                   |
| last_name_kana     | string | null: false                   |
| first_name_kana    | string | null: false                   |
| birthday           | date   | null: false                   |

### Association
- has_many :items
- has_many :orders
---

## items テーブル

| Column                 | Type       | Options                          |
|------------------------|------------|----------------------------------|
| name                   | string     | null: false                      |
| description            | text       | null: false                      |
| price                  | integer    | null: false                      |
| category_id            | integer    | null: false                      |
| condition_id           | integer    | null: false                      |
| shipping_fee_burden_id | integer    | null: false                      |
| prefecture_id          | integer    | null: false                      |
| days_to_ship_id        | integer    | null: false                      |
| user                   | references | null: false, foreign_key: true   |

### Association
- belongs_to :user
- has_one :order
- has_one_attached :image
---

## orders テーブル（購入記録）

| Column | Type       | Options                        |
|--------|------------|--------------------------------|
| user   | references | null: false, foreign_key: true |
| item   | references | null: false, foreign_key: true |

### Association
- belongs_to :user
- belongs_to :item
- has_one :address
---

## addresses テーブル（発送先）

| Column        | Type       | Options                        |
|---------------|------------|--------------------------------|
| postal_code   | string     | null: false                    |
| prefecture_id | integer    | null: false                    |
| city          | string     | null: false                    |
| street        | string     | null: false                    |
| building      | string     |                                |
| phone_number  | string     | null: false                    |
| order         | references | null: false, foreign_key: true |

### Association
- belongs_to :order
