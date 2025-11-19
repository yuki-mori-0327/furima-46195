pin "controllers", to: "controllers/index.js"

pin "application"

pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true

pin "@hotwired/stimulus",         to: "stimulus.min.js", preload: true
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true

pin_all_from "app/javascript/controllers", under: "controllers"


pin "@payjp/payjs", to: "https://js.pay.jp/v2/pay.js"

pin "@rails/activestorage", to: "activestorage.esm.js"

pin "item_price", to: "item_price.js"
pin "card",       to: "card.js"
pin "price_calc", to: "price_calc.js"