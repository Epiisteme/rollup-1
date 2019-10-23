const deposit = require('./deposit');
const depositOnTop = require('./deposit-on-top');
const forceWithdraw = require('./force-withdraw');
const withdraw = require('./withdraw');
const depositAndTransfer = require('./deposit-and-transfer');
const transfer = require('./transfer');

module.exports = {
    deposit,
    depositOnTop,
    forceWithdraw,
    withdraw,
    depositAndTransfer,
    transfer,
};
