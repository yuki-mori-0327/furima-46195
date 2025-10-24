// app/javascript/controllers/index.js
import { application } from "./application"
import CreditCardController from "./credit_card_controller"

// これだけ登録すればOK（stimulus-loading等は不要）
application.register("credit-card", CreditCardController)
