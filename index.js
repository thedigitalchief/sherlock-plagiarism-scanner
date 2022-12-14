// must install dependencies
const express = require("express");
const multer = require("multer");
const path = require("path");
let fs = require("fs");
let PDFParser = require("pdf2json");
const app = express();
const port = process.env.PORT || 3003;
const router = express.Router();
var shell = require("shelljs");

//multer setting
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./public/myuploads");
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + ".pdf");
  }
});

var upload = multer({
  storage: storage
}).single("pdffile");

//set static folder
app.use(express.static("."));
app.use(express.static("./public"));


//routes

//@type - GET /home
//@desc - route to home page
//@access -   PUBLIC
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});


//@type - POST /upload
//@desc - route to check page
//@access -   PUBLIC
app.post("/upload", (req, res) => {
  upload(req, res, error => {
    if (error) {
      return res.end("Error uploading file.");
    } else {
      console.log(`1. Parsing the pdf.`);
      //parsing the pdf ===================
      let pdfParser = new PDFParser(this, 1);
      pdfParser.on("pdfParser_dataError", errData => console.error(errData));
      pdfParser.on("pdfParser_dataReady", pdfData => {
        fs.writeFileSync("./file.txt", pdfParser.getRawTextContent()); //change to ./original.txt here
      });
      console.log(__dirname + "/file.txt");

      pdfParser.loadPDF(
        path.resolve(__dirname + "/public/myuploads/pdffile.pdf")
      );
      console.log("2. Parsing done. Applying NLP to it");
      // spawning NLP script on the PDF text=============

      res.redirect("/check");
      res.end("ended");
    }
  });
});


//@type - POST /upload
//@desc - route to check page
//@access -   PUBLIC
app.use("/", router);
router.get("/check", function(req, res) {
  console.log("In check router.3. Using API to query the NLP string");
  shell.exec("./checker.sh");
  //running shellscript for API

  res.end("ended");
});


module.exports = router;
app.listen(port, () => console.log(`server is running fine at ${port}...`));


