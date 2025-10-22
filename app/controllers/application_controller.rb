class ApplicationController < ActionController::Base
  # 本番 かつ 環境変数が設定されている時だけ、/up 以外に Basic 認証をかける
  before_action :basic_auth, if: :basic_auth_required?

  # deviseコントローラー時に下記メソッドを実行
  before_action :configure_permitted_parameters, if: :devise_controller?

  private

  def basic_auth_required?
    Rails.env.production? &&
      ENV["BASIC_AUTH_USER"].present? &&
      ENV["BASIC_AUTH_PASSWORD"].present? &&
      request.path != "/up"
  end

  def basic_auth
    authenticate_or_request_with_http_basic do |u, p|
      ActiveSupport::SecurityUtils.secure_compare(u.to_s, ENV["BASIC_AUTH_USER"].to_s) &
      ActiveSupport::SecurityUtils.secure_compare(p.to_s, ENV["BASIC_AUTH_PASSWORD"].to_s)
    end
  end

  # 新規登録時、emailとencrypted_password以外もストロングパラメーターとして許可
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up,
      keys: [:nickname, :last_name, :first_name, :last_name_kana, :first_name_kana, :birthday])
  end
end
