import {
  uploadFileToS3,
  listS3File,
  processImageWatermark,
} from "../castleblack";
import connection from "../modules/dbconnection";
import "dotenv/config";
const config = process.env;

const uploadFile = async (
  file: any,
  file_name: string,
  fileBucket: any,
  username: string
) => {
  try {
    await uploadFileToS3(file, file_name, fileBucket);
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
    const results: any = await connection.promise().query(sql, keys);

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
const processFinalWaterMark = async (data: any) => {
  try {

    for (const elem of data){
        const sql = `UPDATE castleblack SET  status = ? WHERE imagekey = ?`;
        connection.query(sql, [elem.status, elem.imagekey], (error, results) => {
            if (error) {
                console.error('Error updating record:', error);
            } else {
                console.log('Record updated successfully:', results);
            }
        });
    }
    //filter out the Approved Request only
    data = data.filter((i: { status: string }) => i.status == "Accepted");
    for (const ele of data) {
      //await processImageWatermark(ele.imagekey, ele.username);

    }
    return true
  } catch (error) {
    return error;
  }
};

export default {
  uploadFile,
  listFile,
  processFinalWaterMark,
};
