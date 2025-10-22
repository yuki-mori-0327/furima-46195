// app/javascript/controllers/index.js
import { application } from "./application"
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading"

// controllers フォルダ配下の *_controller.js を自動登録
eagerLoadControllersFrom("controllers", application)
