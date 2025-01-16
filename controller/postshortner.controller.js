import crypto from 'crypto'
import { readFile } from 'fs/promises';
import path from 'path';
import { loadLinks, saveLinks } from '../models/shortner.model.js';

export const getURLShortner = async (req, res) => {
    try {
        const file = await readFile(path.join("views", "index.html"));
        const links = await loadLinks()

        const content = file.toString().replaceAll("{{shortened_urls}}",
            Object.entries(links).map(([shortCode, url]) => {
                const urlTrim = url.length >= 30 ? `${url.slice(0,30)}...`: url
                return `<li><a href=${shortCode} target="_blank">${req.host}/${shortCode}</a> - ${urlTrim}</li>`
            }).join("")
        )
        return res.send(content)

    } catch (error) {
        console.log(error)
        return res.status(500).send("Internal Server Error")

    }
}

export const postURLShortner = async (req, res) => {
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
}

export const redirectToShortLink = async (req, res) => {
    try {
        const { shortCode } = req.params
        const links = await loadLinks()

        if (!links[shortCode]) return res.status(404).send("404 error occurred")

        return res.redirect(links[shortCode])
    } catch (error) {
        console.log(error)
        res.status(500).send("internal server error!")
    }
}