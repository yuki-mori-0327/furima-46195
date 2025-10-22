Rails.application.routes.draw do
  devise_for :users
  
  # 健康チェック (Render の Health Check 用)
  get "up", to: "rails/health#show"

  # メインルート
  root to: 'items#index'

  resources :items do
    resources :orders, only: [:index, :create]
  end

  # ← ここから追加
  get '/admin/storage_fix', to: 'admin#storage_fix'
  # ← ここまで追加
end
