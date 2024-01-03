/**
 * @description Sequelize Ins
 */
const { Sequelize, DataTypes } = require("sequelize");
const cls = require("cls-hooked");
const { DB } = require("../../config");
let seqOps = { ...DB.MYSQL_CONF, logging: false };

const namespace = cls.createNamespace("seq-namespace");
Sequelize.useCLS(namespace);

const seq = new Sequelize(seqOps);
seq.namespace = namespace;
const test = async () => {
  try {
    await seq.authenticate();
    console.log("@ => Seqalize 已連結");
  } catch (e) {
    console.log("@ => Sequalize 連結發生錯誤 ===> \n", e);
  }
};

test();

module.exports = seq;
