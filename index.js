const cors = require("cors");

const sequelize = require("./utils/sequelize.util");
const sequelizeAssociations = require("./models/association");

const express = require("express");
const router = require("./router");
const config = require("./config/config");

const app = express();
const http = require("http");
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/", router);
app.use(express.static("public"));

app.use((request, response) => {
    response.type("text/plain");
    response.status(404);
    response.send({ success: true, message: "Server Running. Invalid API Path!" }); 
});

sequelize
  .sync()
  .then(async (connection) => {
    sequelizeAssociations();
    server.listen(config.PORT, () => {
      console.log(
        `App running on http://localhost:${config.PORT}`,
      );
    });
  })
  .catch((error) => {
    console.log(error);
    throw error;
  });