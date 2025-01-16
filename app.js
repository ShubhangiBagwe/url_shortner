import express from 'express'
import {shortnerRoutes} from './routes/shortner.routes.js';

const app = express()

const PORT = 3002;

app.use(express.static("public"));
app.use(express.urlencoded({extended:true}))

app.set("view engine","ejs")
// app.use(router)

app.use(shortnerRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
