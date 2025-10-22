import { Application } from "@hotwired/stimulus"
import { definitionsFromContext } from "@hotwired/stimulus-loading"

window.Stimulus = Application.start()
const context = require.context(".", true, /\.js$/)
Stimulus.load(definitionsFromContext(context))
