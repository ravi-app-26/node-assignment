const app = require("./app");
require("dotenv").config();

app.listen(3000,()=>{
    console.log(`Server is running  on ${process.env.URL}`)
})