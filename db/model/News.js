/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { STRING, INTEGER, BOO, DATE } = require('../types')


const News = seq.define('News', {
    id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    type: {
        //  1: User_Follow
        //  2: Blog_Follow
        type: INTEGER,
        allowNull: false,
    },
    news_id: {
        type: INTEGER,
        allowNull: false,
    },
    confirm: {
        type: BOO,
        defaultValue: false,
    },
    showAt: {
        type: DATE
    }
})

module.exports = News