const dotenv =  require("dotenv");
dotenv.config();

const express = require("express");
const app = express();

const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const crypto = require("crypto");

const port = process.env.PORT || 8000;

app.set("view engine", "ejs");
app.use(express.json());

const maxSize = 5 * 1000 * 1000;

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: {fileSize: maxSize}}).single("image");

app.use("/images", express.static("photos"));

app.get("/", function (request, result) {
    result.render("index")
})

app.post("/uploadImage", async (req, res)=>{

    upload(req, res, async (err)=>{

        if(err){
            console.log(err);
            res.json({message:"select a file less than 5mb to upload"});
            return;
        }

        const { buffer, originalname } = req.file;
        const timestamp = Date.now();

        let ext = path.extname(originalname.toLowerCase());

        const ref = `${timestamp}_${crypto.createHash('sha256').update(crypto.randomBytes(20), 'utf-8').digest('hex')}${ext}`;
    
        if(ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg')
            res.json({message: "Invalid format, select png, jpg files"})
        else
        {
            await sharp(buffer, { failOnError: false })
            .resize({ width: 400, height: 300, fit: 'fill'})
            .jpeg({mozjpeg: true, quality: 30, progressive: true})
            .toFile(`./photos/${ref}`)
    
            const link = `${process.env.SERVER_HOST}:${port}/images/${ref}`;
    
             res.json({ link });
        }

    })

   


})


app.listen(port, () =>{
    console.log(`Server running on port ${port}`);
})