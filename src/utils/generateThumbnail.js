const filestack = require("filestack-js").init(process.env.FILESTACK_KEY);
const fs = require("fs");
const path = require("path");
async function generateThumbnail(req, res, next) {
    if(!req.file) return next();
  const tempDirectoryPath = path.join(__dirname, "temp");
  // Create temp directory if it does not exist
  if (!fs.existsSync(tempDirectoryPath)) {
    fs.mkdirSync(tempDirectoryPath);
  }

  // Create paths for temporary PDF and thumbnail files
  const tempPdfFilePath = path.join(tempDirectoryPath, `${Date.now()}.pdf`);
  const tempThumbnailFilePath = path.join(
    tempDirectoryPath,
    `${Date.now()}.j`
  );
  fs.writeFileSync(tempPdfFilePath, req.file.buffer);
  // generate a thumbnail image from the PDF
  await filestack
    .upload(tempPdfFilePath)
    .then((response) => {
      const externalUrl = response.url;
      const thumbnailUrl = `https://cdn.filestackcontent.com/${process.env.FILESTACK_KEY}/output=format:jpg,quality:70/${externalUrl}`;
      req.thumbnailUrl = thumbnailUrl;
    })
    .catch((error) => {
      console.error(error);
      next(error);
    });
}

module.exports = generateThumbnail;
