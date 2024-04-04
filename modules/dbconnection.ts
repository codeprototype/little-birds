import mysql from "mysql2";
const config = process.env;
const connectionString:any = config.MYSQL_CONN_STRING
const connection = mysql.createConnection(connectionString);
connection.connect((error: any) => {
  if (error) {
    console.error("Error connecting to MySQL database:", error);
  } else {
    console.log("Connected to MySQL database!");
  }
});

export default connection;
