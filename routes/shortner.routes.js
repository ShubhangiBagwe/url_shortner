import express from 'express';
import {postURLShortner,getURLShortner,redirectToShortLink} from '../controller/postshortner.controller.js'

const router = express.Router()

router.get("/",getURLShortner )

router.post("/",postURLShortner)

router.get("/:shortCode",redirectToShortLink)


export const shortnerRoutes = router;