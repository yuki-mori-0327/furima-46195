class OrderForm
  include ActiveModel::Model
  include ActiveModel::Validations::Callbacks # 正規化用

  attr_accessor :user_id, :item_id,
                :postal_code, :prefecture_id, :city, :addresses, :building, :phone_number,
                :token

  before_validation :normalize_fields

  with_options presence: true do
    validates :user_id
    validates :item_id

    validates :postal_code, format: { with: /\A\d{3}-\d{4}\z/, message: 'is invalid. Include hyphen(-)' }
    validates :city
    validates :addresses
    validates :phone_number, format: { with: /\A0\d{9,10}\z/, message: 'is invalid' }

    validates :token
  end

  validates :prefecture_id, numericality: { other_than: 1, message: "can't be blank" }

  def save
    ActiveRecord::Base.transaction do
      order = Order.create!(user_id: user_id, item_id: item_id)

      Address.create!(
        order_id: order.id,
        postal_code: postal_code,
        prefecture_id: prefecture_id,
        city: city,
        addresses: addresses,
        building: building,
        phone_number: phone_number
      )
    end
    true
  rescue ActiveRecord::RecordInvalid
    false
  end

  private

  def normalize_fields
    self.postal_code  = to_hankaku(postal_code).to_s
    self.phone_number = to_hankaku(phone_number).to_s.gsub(/-/, '')

    just7 = postal_code&.gsub(/-/, '')
    self.postal_code = just7.insert(3, '-') if just7&.match?(/\A\d{7}\z/)

    self.prefecture_id = prefecture_id.to_i if prefecture_id.present?
  end

  def to_hankaku(str)
    return str if str.blank?

    s = str.to_s.unicode_normalize(:nfkc)
    s.gsub(/[‐-‒–—―−ーｰ]/, '-')
  end
end
