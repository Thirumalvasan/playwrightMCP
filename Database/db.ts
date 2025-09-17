import sql from "mssql";
// db.ts
const config = {
  user: "sa",
  password: "cal@123",
  database: "ASRS_Milkymist_05-09-2025",
  server: "192.168.5.73",
  options: {
    encrypt: false, // true if using Azure or SSL
    trustServerCertificate: true
  }
};

export async function queryDb(query: string) {
  const pool = await sql.connect(config);
  const result = await pool.request().query(query);
  return result.recordset;
}
