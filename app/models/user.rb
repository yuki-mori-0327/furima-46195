class User < ApplicationRecord
  # devise のモジュール
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :items, dependent: :destroy
  has_many :orders, dependent: :destroy

  # パスワード：英字＋数字両方含む
  VALID_PASSWORD_REGEX = /\A(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+\z/

  with_options presence: true do
    validates :nickname

    # 名前：全角（漢字・ひらがな・カタカナ）
    validates :last_name,  format: { with: /\A[ぁ-んァ-ヶ一-龥々ー]+\z/, message: 'is invalid' }
    validates :first_name, format: { with: /\A[ぁ-んァ-ヶ一-龥々ー]+\z/, message: 'is invalid' }

    # フリガナ：全角カタカナ
    validates :last_name_kana,  format: { with: /\A[ァ-ヶー－]+\z/, message: 'is invalid' }
    validates :first_name_kana, format: { with: /\A[ァ-ヶー－]+\z/, message: 'is invalid' }

    validates :birthday
  end

  # パスワード：英数字混在
  validates :password,
            format: { with: VALID_PASSWORD_REGEX, message: 'Include both letters and numbers' }
end
