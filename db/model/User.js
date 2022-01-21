/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { STRING , INTEGER} = require('../types')


const User = seq.define('User', {
    username: {
        type: STRING,
        allowNull: false,
        validate: {
            is: /\w{2,20}/,
            notNull: true,
        }
    },
    age: {
        type: INTEGER,
        validate: {
            is: /\d/,
            max: 150,
            min: 1
        }
    },
    nickName: {
        type: STRING,
        allowNull: false,
        validate: {
            is: /\w{2,20}/,
            notNull: true,
        }
    },
    avatar: {
        type: STRING
    }
})

module.exports = User