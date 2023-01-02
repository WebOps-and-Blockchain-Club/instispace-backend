import { google } from "googleapis";
const sheets = google.sheets("v4");

export const writeSheet = async (
  roll: string,
  name: string,
  rating1: number,
  rating2: number,
  rating3: number,
  ans1: string,
  ans2: string,
  ans3: string
) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "./src/utils/keys.json", //the key file
    //url to spreadsheets API
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  let authClient = await auth.getClient();
  const request = {
    spreadsheetId: "1ECJ1V1KoJB7W3jNyrOD_F-46tKl_ZNPGRPNqMqZkNsA",
    range: "Sheet1!B:I",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    resource: {
      values: [[roll, name, rating1, rating2, rating3, ans1, ans2, ans3]],
    },

    auth: authClient,
  };

  try {
    const response = (await sheets.spreadsheets.values.append(request)).data;
    return JSON.stringify(response, null, 2);
  } catch (err) {
    throw new Error(err);
  }
};
