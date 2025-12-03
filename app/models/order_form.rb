# app/models/order_form.rb
class OrderForm
  include ActiveModel::Model
  include ActiveModel::Validations::Callbacks  # 正規化用

  # 注意：DB/ビュー/コントローラと完全一致させる
  attr_accessor :user_id, :item_id,
                :postal_code, :prefecture_id, :city, :addresses, :building, :phone_number,
                :token

  # ------ 正規化（全角→半角・ハイフン除去） ------
  before_validation :normalize_fields

  with_options presence: true do
    validates :user_id
    validates :item_id

    validates :postal_code,  format: { with: /\A\d{3}-\d{4}\z/, message: 'is invalid. Include hyphen(-)' }
    validates :city
    validates :addresses
    # 先頭0で10〜11桁（ハイフン不可）
    validates :phone_number, format: { with: /\A0\d{9,10}\z/, message: 'is invalid' }
  end

  # --- のIDが 1 の想定（0運用なら 0 に変更）
  validates :prefecture_id, numericality: { other_than: 1, message: "can't be blank" }

  def save
    ActiveRecord::Base.transaction do
      order = Order.create!(user_id: user_id, item_id: item_id)

      Address.create!(
        order_id:       order.id,
        postal_code:    postal_code,
        prefecture_id:  prefecture_id,
        city:           city,
        addresses:      addresses,
        building:       building,
        phone_number:   phone_number
      )
    end
    true
  rescue ActiveRecord::RecordInvalid
    false
  end

  private

  # 入力を正規化：全角→半角、ハイフン除去、郵便番号にハイフン自動付与
  def normalize_fields
    self.postal_code  = to_hankaku(postal_code).to_s
    self.phone_number = to_hankaku(phone_number).to_s.gsub(/-/, '')

    # 郵便番号：数字7桁だけなら 123-4567 に整形
    just7 = postal_code&.gsub(/-/, '')
    self.postal_code = just7.insert(3, '-') if just7&.match?(/\A\d{7}\z/)

    # prefecture_id は数値化（フォーム送信で文字列になりがち）
    self.prefecture_id = prefecture_id.to_i if prefecture_id.present?
  end

 def to_hankaku(str)
  return str if str.blank?

  # 全角→半角（互換）に正規化
  s = str.to_s.unicode_normalize(:nfkc)

  # いろいろなハイフン/長音/マイナス記号を ASCII ハイフンに寄せる
  # ‐-‒–—―− ー ｰ など
  s.gsub(/[‐-‒–—―−ーｰ]/, '-')
  end
end
