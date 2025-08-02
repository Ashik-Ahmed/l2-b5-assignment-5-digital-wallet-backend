"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRANSACTION_STATUS = exports.TRANSACTION_TYPES = void 0;
var TRANSACTION_TYPES;
(function (TRANSACTION_TYPES) {
    TRANSACTION_TYPES["ADD_MONEY"] = "add_money";
    TRANSACTION_TYPES["WITHDRAW"] = "withdraw";
    TRANSACTION_TYPES["SEND_MONEY"] = "send_money";
    TRANSACTION_TYPES["CASH_IN"] = "cash_in";
    TRANSACTION_TYPES["CASH_OUT"] = "cash_out";
    TRANSACTION_TYPES["COMMISSION"] = "commission";
    TRANSACTION_TYPES["CASH_OUT_FEE"] = "cashout_fee";
    TRANSACTION_TYPES["SEND_MONEY_FEE"] = "send_money_fee";
})(TRANSACTION_TYPES || (exports.TRANSACTION_TYPES = TRANSACTION_TYPES = {}));
var TRANSACTION_STATUS;
(function (TRANSACTION_STATUS) {
    TRANSACTION_STATUS["PENDING"] = "pending";
    TRANSACTION_STATUS["COMPLETED"] = "completed";
    TRANSACTION_STATUS["FAILED"] = "failed";
    TRANSACTION_STATUS["REVERSED"] = "reversed";
})(TRANSACTION_STATUS || (exports.TRANSACTION_STATUS = TRANSACTION_STATUS = {}));
