const express = require("express");
const https = require("https");
const csv = require("csv-parser");

const app = express();
const PORT = process.env.PORT || 3000;

let parcelData = [];

// URL of the hosted CSV file
const csvUrl = "https://dakshinakashi.com/NCC_data.csv";

// Function to fetch and load CSV data
function loadCSV() {
  console.log("Fetching CSV from URL:", csvUrl);

  https.get(csvUrl, (response) => {
    if (response.statusCode !== 200) {
      console.error("Failed to fetch CSV file. Status code:", response.statusCode);
      return;
    }

    response
      .pipe(csv())
      .on("data", (row) => {
        if (row.ADDRESS && row.ADDRESS.trim() && row.PRCLKEY) {
          parcelData.push(row); // Store rows that have valid ADDRESS and PRCLKEY
        }
      })
      .on("end", () => {
        console.log("CSV file successfully loaded. Total rows:", parcelData.length);
      })
      .on("error", (err) => {
        console.error("Error processing the CSV file:", err.message);
      });
  }).on("error", (err) => {
    console.error("Error fetching the CSV file:", err.message);
  });
}

// Load the CSV data when the server starts
loadCSV();

// API endpoint to search for a parcel key
app.get("/get-parcel-key", (req, res) => {
  const inputAddress = (req.query.address || "").trim().toUpperCase();

  if (!inputAddress) {
    return res.status(400).json({ error: "Address is required" });
  }

  console.log("Searching for input address:", inputAddress);

  // Find an exact match
  const match = parcelData.find((row) => row.ADDRESS.trim() === inputAddress);

  if (match) {
    res.json({ parcel_key: match.PRCLKEY });
  } else {
    console.log("No match found for input address:", inputAddress);
    res.status(404).json({ error: "Parcel Key not found" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
