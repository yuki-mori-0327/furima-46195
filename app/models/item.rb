class Item < ApplicationRecord
  extend ActiveHash::Associations::ActiveRecordExtensions

  belongs_to :user
  has_one :order, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_one_attached :image

  belongs_to :category
  belongs_to :condition
  belongs_to :shipping_fee_status
  belongs_to :prefecture
  belongs_to :scheduled_delivery

  with_options presence: true do
    validates :image
    validates :name
    validates :explanation

    validates :category_id
    validates :condition_id
    validates :shipping_fee_status_id
    validates :prefecture_id
    validates :scheduled_delivery_id

    validates :price,
              numericality: { only_integer: true, greater_than_or_equal_to: 300, less_than_or_equal_to: 9_999_999 }
  end

  with_options numericality: { other_than: 0 } do
    validates :category_id
    validates :condition_id
    validates :shipping_fee_status_id
    validates :prefecture_id
    validates :scheduled_delivery_id
  end
end
