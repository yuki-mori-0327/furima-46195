Rails.application.routes.draw do
  root "items#index"   # トップページを items コントローラの index アクションに設定
  resources :items
end
