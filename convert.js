const csv = require("csvtojson");
const fs = require("fs");

csv()
  .fromFile("tyres.csv")
  .then((jsonObj) => {
    fs.writeFileSync(
      "./src/data/tyres.json",
      JSON.stringify(jsonObj, null, 2)
    );

    console.log("DONE - tyres.json created");
  });