/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { INTEGER, BOO } = require('../types')

const ArticleReader = seq.define(
    'ArticleReader',
    {
        id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        article_id: {
            type: INTEGER
        },
        reader_id: {
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

module.exports = ArticleReader