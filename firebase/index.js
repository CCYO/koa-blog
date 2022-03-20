import { create, findCurrentUser, signIn, logout } from './auth'
import { update, getUrl } from './storage'
import { writeUserData, readUserData } from './realtimeDB'

window._firebase = {
    auth: { create, findCurrentUser, signIn, logout },
    storage: { update, getUrl },
    realtimeDB: { writeUserData ,readUserData }
}