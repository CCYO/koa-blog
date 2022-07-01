/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { INTEGER, BOO } = require('../types')

const FollowBlog = seq.define(
    'FollowBlog',
    {
        id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        blog_id: {
            type: INTEGER
        },
        follower_id: {
            type: INTEGER
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

module.exports = FollowBlog