import SERVER_CONST from '../../../../../server/conf/constant'
const CONST = {
    BLOG: {
        HTML_MAX_LENGTH: SERVER_CONST.BLOG.HTML_MAX_LENGTH,
        HTML_MIN_LENGTH: SERVER_CONST.BLOG.HTML_MIN_LENGTH
    },
    URL: 'http://my.ajv.schema',
    VALIDATE: {
        DEFS: 'defs',
        EMAIL: 'email',
        REGISTER: 'register',
        LOGIN: 'login',
        PASSWORD: 'password',
        AVATAR: 'avatar',
        SETTING: 'setting',
        BLOG: 'blog',
        IMG_ALT: 'alt'
    },
    API: {
        EMAIL: '/api/user/isEmailExist',
        PASSWORD: '/api/user/confirmPassword'
    }
}
export default CONST