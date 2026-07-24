import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

let myport=process.env.PORT;

console.log("Start of the backend project");
console.log("Added nodemon");
console.log("PORT : ",myport);