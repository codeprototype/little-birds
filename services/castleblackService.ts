import {
  uploadFileToS3,
  listS3File,
  processImageWatermark,
} from "../castleblack";
import connection from "../modules/dbconnection";
import "dotenv/config";
const config = process.env;
const processWaterMark = async () => {
  try {
    await processImageWatermark("1.jpg", "Maaz");
    return true;
  } catch (error) {
    return error;
  }
};
const uploadFile = async (
  file: any,
  file_name: string,
  fileBucket: any,
  isWatermarkProcess: boolean,
  username: string
) => {
  try {
    // await uploadFileToS3(
    //   file,
    //   file_name,
    //   fileBucket,
    //   false,
    //   username
    // );
    const sql = `INSERT INTO castleblack (imagekey, username) VALUES (?, ?)`;
    connection.query(sql, [file_name, username], (error: any, results: any) => {
      if (error) {
        console.error("Error creating record:", error);
      } else {
        console.log("Record created successfully:", results);
      }
    });
    return true;
  } catch (error) {
    return error;
  }
};

const listFile = async (fileBucket: any) => {
  try {
    let finalData: any = [];
    const { keys }: any = await listS3File(fileBucket);
    const placeholders = keys.map(() => "?").join(",");
    const sql = `SELECT * FROM castleblack WHERE imagekey IN (${placeholders})`;
   const results:any = await connection.promise().query(sql, keys)

      keys
        .map((key: any) => {
          const record = results[0].find(
            (row: { imagekey: any }) => row.imagekey === key
          );
          if (record) {
            finalData.push({
              url: config.AWS_PUBLIC_URL + key,
              ...record,
            });
          }
        })
        .filter(Boolean);
    

    return finalData;
  } catch (error) {
    return error;
  }
};

export default {
  processWaterMark,
  uploadFile,
  listFile,
};
