/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { STRING, INTEGER, BOO } = require('../types')


const News = seq.define('News', {
    id: {
        type: INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    news_type: {
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
    }
})

module.exports = News