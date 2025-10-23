// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"
import "item_price"
import "card"

import * as ActiveStorage from "@rails/activestorage"
ActiveStorage.start()
