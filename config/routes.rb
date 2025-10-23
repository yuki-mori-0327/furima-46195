Rails.application.routes.draw do
  devise_for :users
  get "up", to: "rails/health#show"
  root to: "items#index"

  resources :items do
    resources :orders, only: [:index, :create]
  end

  # 管理ツール
  get  "/admin/storage_fix",   to: "admin#storage_fix"
  post "/admin/storage_copy",  to: "admin#storage_copy"
  post "/admin/storage_switch", to: "admin#storage_switch"
end
