import { writeFile } from 'fs/promises'; // Use promises API for writeFile
import { readFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import express from 'express'

const app = express()

const PORT = 3002;
const DATA_FILE = path.join("data", "links.json");

app.use(express.static("public"));
app.use(express.urlencoded({extended:true}))

const loadLinks = async () => {
    try {
        const data = await readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === "ENOENT") {
            await writeFile(DATA_FILE, JSON.stringify({}, null, 2), 'utf-8');
            return {};
        }
        throw error;
    }
};

const saveLinks = async (links) => {
    try {
        await writeFile(DATA_FILE, JSON.stringify(links, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error saving links:", error);
        throw error;
    }
};


app.get("/", async (req, res) => {
    try {
        const file = await readFile(path.join("views", "index.html"));
        const links = await loadLinks()

        const content = file.toString().replaceAll("{{shortened_urls}}",
            Object.entries(links).map(([shortCode,url])=>
                `<li><a href=${shortCode} target="_blank">${req.host}/${shortCode}</a> - ${url}</li>`
            ).join("")
        )
        return res.send(content)

    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal Server Error")

    }
})

app.post("/", async (req, res) => {
    try {
        const { url, shortCode } = req.body;
        const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");
        const links = await loadLinks()

        if (links[finalShortCode]) {
            return res.status(400).send("Short code already exists. Please choose another.")
        }

        links[finalShortCode] = url;
        await saveLinks(links);
        return res.redirect("/")
    } catch (err) {
        console.log("err")
        res.status(500).send("Internal Server Error")
    }
})

app.get("/:shortCode",async(req,res)=>{
    try{
        const {shortCode} = req.params
        const links = await loadLinks()

        if (!links[shortCode]) return res.status(404).send("404 error occurred")
        
        return res.redirect(links[shortCode])
    }catch(error){
        console.log(error)
        res.status(500).send("internal server error!")
    }
})



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
