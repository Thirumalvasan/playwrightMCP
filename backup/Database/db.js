"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryDb = queryDb;
const mssql_1 = __importDefault(require("mssql"));
const config = {
    user: "sa",
    password: "ca123",
    database: "ASRS_Milkymist",
    server: "192.168.221.31",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};
async function queryDb(query) {
    const pool = await mssql_1.default.connect(config);
    const result = await pool.request().query(query);
    return result.recordset;
}
