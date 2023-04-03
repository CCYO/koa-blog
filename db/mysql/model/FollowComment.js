/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { INTEGER, BOO } = require('../types')

const FollowComment = seq.define(
    'FollowComment',
    {
        id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        comment_id: {
            type: INTEGER,
            allowNull: false
        },
        follower_id: {
            type: INTEGER,
            allowNull: false
        },
        confirm: {
            type: BOO,
            defaultValue: false
        }
    },
    {
        paranoid: true
    }
)

module.exports = FollowComment