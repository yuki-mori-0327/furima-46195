// app/javascript/controllers/index.js
import { application } from "./application"
import CreditCardController from "./credit_card_controller"

application.register("credit-card", CreditCardController)
