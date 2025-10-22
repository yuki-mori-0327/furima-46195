Rails.application.routes.draw do
  devise_for :users
  
  # 健康チェック (Render の Health Check 用)
  get "up", to: "rails/health#show"

  # メインルート
  root to: 'items#index'

  resources :items do
    resources :orders, only: [:index, :create]
  end
end
