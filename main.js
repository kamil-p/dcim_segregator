const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const env = require('dotenv').config();
const cliProgress = require('cli-progress');

const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

if (env.error) {
  console.log('Error loading .env file');
  process.exit(1);
}

const inputDir = env.parsed.INPUT_DIR;
const outputDir = env.parsed.OUTPUT_DIR;

console.log('Input dir:', inputDir);
console.log('Output dir:', outputDir);

function isDCIM(filePath) {
  return filePath.endsWith('.jpeg')
    || filePath.endsWith('.jpg')
    || filePath.endsWith('.mov')
    || filePath.endsWith('.mp4');
}

function getLastDayOfMonth(date) {
  let newDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return newDate;
}

function getMonthDirectoryName(filePath) {
  let creationDate = fs.statSync(filePath).mtime;
  let lastDayOfMonth = getLastDayOfMonth(creationDate);
  return lastDayOfMonth.toISOString().split('T')[0];
}

function isDirExist(directoryPath) {
  return fs.existsSync(directoryPath) && fs.lstatSync(directoryPath).isDirectory();
}

function mkdir(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
  // console.log('Created directory:', directoryPath);
}

let yearDirsCount = 0;
let monthDirsCount = 0;
let filesCount = 0;

files = fs.readdirSync(inputDir);

progressBar.start(files.length, 0);
files.forEach(file => {
  let filePath = path.join(inputDir, file);
  progressBar.increment();

  if (!isDCIM(filePath)) {
    console.log('File is not JPEG:', filePath);
    return;
  }

  let creationDate = fs.statSync(filePath).mtime;
  let yearDirectoryName = path.join(outputDir, creationDate.getFullYear().toString());
  let monthDirectoryName = path.join(yearDirectoryName, getMonthDirectoryName(filePath) + ' Smartphone');

  if (!isDirExist(yearDirectoryName)) {
    mkdir(yearDirectoryName);
    yearDirsCount++;
  }

  if (!isDirExist(monthDirectoryName)) {
    mkdir(monthDirectoryName);
    monthDirsCount++;
  }

  let newFilePath = path.join(monthDirectoryName, file);
  fse.copySync(filePath, newFilePath);
  filesCount++;

  // console.log('Copied file to:', newFilePath);

});

progressBar.stop();
console.log(`Job completed, total number years ${yearDirsCount} dirs, month ${monthDirsCount} dirs created and files copied ${filesCount}`);