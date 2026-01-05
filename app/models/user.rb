class User < ApplicationRecord
  # devise のモジュール（たぶんもう書いてあるやつ）
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

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

  # パスワード：英数字混在バリデーション（allow_blank 付けないのがポイント）
  validates :password, format: { with: VALID_PASSWORD_REGEX, message: 'Include both letters and numbers' }
end
