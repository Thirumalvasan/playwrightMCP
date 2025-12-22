"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mssql_1 = __importDefault(require("mssql"));
const palletMasterData_1 = require("../testData/palletMasterData");
const test_1 = require("@playwright/test");
const config = {
    user: 'sa',
    password: 'cal@123',
    server: '192.168.5.73',
    database: 'ASRS_Milkymist_05-09-2025',
    options: {
        encrypt: true, // for Azure
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
};
test_1.test.describe('Backend Pallet Insert Verification', () => {
    (0, test_1.test)('should find the newly added pallet in the database', async () => {
        const palletId = `${palletMasterData_1.palletMasterData.palletIdPrefix}${palletMasterData_1.palletMasterData.palletIdStart}`;
        let pool;
        try {
            pool = await mssql_1.default.connect(config);
            const result = await pool.request()
                .input('PalletId', mssql_1.default.VarChar, palletId)
                .query('SELECT * FROM Master_Pallet WHERE PalletId = @PalletId');
            (0, test_1.expect)(result.recordset.length).toBeGreaterThan(0);
            // Optionally, check description or other fields
            // expect(result.recordset[0].Description).toBeDefined();
        }
        finally {
            if (pool)
                await pool.close();
        }
    });
});
