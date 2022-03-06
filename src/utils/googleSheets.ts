import { google } from "googleapis";
const sheets = google.sheets("v4");

export const writeSheet = async (
  roll: string,
  name: string,
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
    spreadsheetId: "1S_hNVMmB-oXElcb0yRAP22geq6RNKWZsknDX1ByF-NQ",
    range: "Sheet1!B:F",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    resource: {
      values: [[roll, name, ans1, ans2, ans3]],
    },

    auth: authClient,
  };

  try {
    const response = (await sheets.spreadsheets.values.append(request)).data;
    console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error(err);
  }
};
