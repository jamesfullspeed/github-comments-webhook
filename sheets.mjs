import { google } from "googleapis";
import fs from "fs";

// Load Google service account credentials
const credentials = JSON.parse(
  fs.readFileSync(new URL("./github-slack-google-sheet-key.json", import.meta.url), "utf8")
);

// Create Google Sheets client
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// --- CONFIGURE YOUR SHEET ---
const spreadsheetId = "1QgX1MSIeDT_z-XSDlJb-IvDrYzVwqZQ9vNlQsCnDAh8"; // from the URL
const range = "Sheet1!A:H"; // Adjust columns and sheet name as needed
const columnOrder = ["Date", "Flags", "Ticket", "Pull Request", "Author", "Comment", "Points", "Commenter"]; 
// 👆 These must match the object keys you expect

/**
 * Appends a row to the Google Sheet based on the columnOrder above.
 *
 * @param {Object} data - Object with keys matching the columnOrder names.
 * Example:
 * await appendRow({
 *   Date: "2025-09-29",
 *   Flags: "urgent",
 *   Ticket: "#1234",
 *   "Pull Request": "https://github.com/repo/pull/567",
 *   Author: "Alice",
 *   Comment: "Fixed issue",
 *   Points: 5,
 *   Commenter: "Bob"
 * });
 */
export async function appendRow(data) {
  const values = [
    columnOrder.map(key => data[key] ?? "") // preserve column order
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });

  //console.log("✅ Row appended:", values[0]);
}