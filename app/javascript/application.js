import "@hotwired/turbo-rails"
import "controllers"   // ← pin_all_from してるのでこれで解決できる
import "item_price"
import "card"

import * as ActiveStorage from "@rails/activestorage"
ActiveStorage.start()

import "price_calc"