import create from './auth'
import update from './storage'

window._firebase = {
    auth: { create },
    storage: { update }
}