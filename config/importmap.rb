# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus",          to: "stimulus.min.js", preload: true
pin "@hotwired/stimulus-loading",  to: "stimulus-loading.js", preload: true
pin_all_from "app/javascript/controllers", under: "controllers"  
pin "@rails/activestorage", to: "activestorage.esm.js"
pin "item_price", to: "item_price.js"
pin "card",       to: "card.js"