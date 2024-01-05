const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Project = require("./../../models/projectModel");
const Item = require("./../../models/itemModel");
const User = require("./../../models/userModel");
const Quotation = require("./../../models/quotationModel");

// DELETE IMAGES FROM FS
function deleteFilesInFolderSync(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      fs.unlinkSync(filePath);
    }

    console.log("All files in the folder have been deleted.");
  } catch (err) {
    console.error("Error deleting files:", err);
  }
}

// COPY IMG TO PUBLIC FOLDER
function copyFilesFromSourceToDestFolderSync(
  sourceFolderPath,
  destinationFolderPath
) {
  try {
    const files = fs.readdirSync(sourceFolderPath);

    for (const file of files) {
      const sourceFilePath = path.join(sourceFolderPath, file);
      const destinationFilePath = path.join(destinationFolderPath, file);

      // Copy each file to the destination folder
      fs.copyFileSync(sourceFilePath, destinationFilePath);
    }

    console.log("All files have been copied.");
  } catch (err) {
    console.error("Error copying files:", err);
  }
}

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB connection succesful"));

// READ JSON FILE
const projects = JSON.parse(
  fs.readFileSync(`${__dirname}/projects.json`, "utf-8")
);
const items = JSON.parse(fs.readFileSync(`${__dirname}/items.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const quotations = JSON.parse(
  fs.readFileSync(`${__dirname}/quotations.json`, "utf-8")
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await User.create(users, { validateBeforeSave: false });
    await Item.create(items);
    await Project.create(projects);
    await Quotation.create(quotations);
    console.log("Data succesfully loaded");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Project.deleteMany();
    await User.deleteMany();
    await Quotation.deleteMany();
    await Item.deleteMany();
    console.log("Data deleted succesfully");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
  copyFilesFromSourceToDestFolderSync(
    "dev-data/resized-imgs",
    "public/img/projects"
  );
} else if (process.argv[2] === "--delete") {
  deleteData();
  deleteFilesInFolderSync(`public/img/projects`);
}
