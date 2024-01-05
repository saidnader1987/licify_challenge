const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const sourceFolder = "dev-data/raw-imgs";
const destinationFolder = "dev-data/resized-imgs";

async function resizeImages(sourceFolderPath, destinationFolderPath) {
  try {
    const files = fs.readdirSync(sourceFolderPath);

    for (const file of files) {
      const sourceFilePath = path.join(sourceFolderPath, file);
      const destinationFilePath = path.join(destinationFolderPath, file);

      await sharp(sourceFilePath)
        .resize(600, 600)
        .toFormat("jpg")
        .jpeg({ quality: 90 })
        .toFile(destinationFilePath);
    }

    console.log("All images have been resized.");
  } catch (err) {
    console.error("Error resizing images:", err);
  }
}

resizeImages(sourceFolder, destinationFolder);
