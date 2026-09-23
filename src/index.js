import dns from "dns";

dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);

import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/database.js";



const port = process.env.PORT || 3000;


connectDB()
    .then(()=>{
        app.listen(port, ()=>{
            console.log(`Example app listening on port http://localhost:${port}`);
        });
    })
    .catch( (err) =>{
        console.error("MongoDB connection error", err)
        process.exit(1);
    })
