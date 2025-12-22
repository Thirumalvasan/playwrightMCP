import sql from "mssql";
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

export async function queryDb(query: string) {
  const pool = await sql.connect(config);
  const result = await pool.request().query(query);
  return result.recordset;
}
