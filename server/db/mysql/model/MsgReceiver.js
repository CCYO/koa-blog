/**
 * @description Sequelize Model
 */
const seq = require('../seq')
const { INTEGER, BOO, DATE, NOW } = require('../types')

const MsgReceiver = seq.define(
    'MsgReceiver',
    {
        id: {
            type: INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        msg_id: {
            type: INTEGER,
            allowNull: false
        },
        receiver_id: {
            type: INTEGER,
            allowNull: false
        },
        confirm: {
            type: BOO,
            defaultValue: false
        },
        createdAt: {
            type: DATE,
            allowNull: false,
            defaultValue: NOW
        }
    },
    {
        paranoid: true,
        createdAt: false
    }
)

module.exports = MsgReceiver