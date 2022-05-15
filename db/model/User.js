/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { STRING , INTEGER} = require('../types')


const User = seq.define('User', {
    email: {
        type: STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notNull: true
        }
    },
    password: {
        type: STRING,
        allowNull: false,
        validate: {
            notNull: true,
            is: /^[\w]+$/,
            len: [32, 32]
        }
    },
    age: {
        type: INTEGER,
        validate: {
            is: /^[\d]+$/,
            max: 150,
            min: 1
        }
    },
    nickname: {
        type: STRING,
        allowNull: true,
        validate: {
            is: /^[\w@.]+$/,
            len: [2,30],
            notNull: false,
        }
    },
    avatar: {
        type: STRING,
        allowNull: true,
    },
    avatar_hash: {
        type: STRING,
        allowNull: true,
    }
})

module.exports = User