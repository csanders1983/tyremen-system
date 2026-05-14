const fs = require("fs");
const path = require("path");
const axios = require("axios");
const csv = require("csv-parser");

const results = [];

const IMAGE_FOLDER = path.join(__dirname, "public", "alloy-wheels");

if (!fs.existsSync(IMAGE_FOLDER)) {
  fs.mkdirSync(IMAGE_FOLDER, { recursive: true });
}

function cleanFileName(text) {
  return text
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

fs.createReadStream("stockwheelimgtest.csv")
  .pipe(csv())
  .on("data", (row) => {
    results.push(row);
  })
  .on("end", async () => {
    console.log(`Found ${results.length} wheels`);

    for (const wheel of results) {
      try {
        const imageUrl = wheel["Image URL"];

        if (!imageUrl || imageUrl.trim() === "") {
          console.log(`Skipping missing image`);
          continue;
        }

        const brand = cleanFileName(wheel.Brand || "wheel");
        const model = cleanFileName(wheel.Model || "model");
        const finish = cleanFileName(wheel.Finish || "finish");

        const ext = path.extname(imageUrl).split("?")[0] || ".jpg";

        const filename = `${brand}-${model}-${finish}${ext}`;

        const savePath = path.join(IMAGE_FOLDER, filename);

        console.log(`Downloading ${filename}`);

        const response = await axios({
          method: "GET",
          url: imageUrl,
          responseType: "stream",
        });

        const writer = fs.createWriteStream(savePath);

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        wheel["Image URL"] = `/alloy-wheels/${filename}`;

      } catch (err) {
        console.log(`FAILED: ${wheel.Model}`);
      }
    }

    console.log("DONE");
  });