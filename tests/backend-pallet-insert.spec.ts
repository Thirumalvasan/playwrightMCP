import sql from 'mssql';
import { palletMasterData } from '../testData/palletMasterData';
import { test, expect } from '@playwright/test';

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

test.describe('Backend Pallet Insert Verification', () => {
  test('should find the newly added pallet in the database', async () => {
    const palletId = `${palletMasterData.palletIdPrefix}${palletMasterData.palletIdStart}`;
    let pool;
    try {
      pool = await sql.connect(config);
      const result = await pool.request()
        .input('PalletId', sql.VarChar, palletId)
        .query('SELECT * FROM Master_Pallet WHERE PalletId = @PalletId');
      expect(result.recordset.length).toBeGreaterThan(0);
      // Optionally, check description or other fields
      // expect(result.recordset[0].Description).toBeDefined();
    } finally {
      if (pool) await pool.close();
    }
  });
});
