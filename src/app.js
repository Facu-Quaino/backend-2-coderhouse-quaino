import express from "express";
import routes from "./routes/index.js";
import __dirname from "./dirname.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import viewsRoutes from "./routes/views.routes.js";
import { connectMongoDB } from "./config/mongoDB.config.js";
import session from "express-session";
import { initializePassport } from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import envsConfig from "./config/envs.config.js";

const app = express();

connectMongoDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine("handlebars", handlebars.engine()); 
app.set("views", __dirname + "/views"); 
app.set("view engine", "handlebars"); 
app.use(express.static("public"));

app.use(
  session({
    secret: envsConfig.SECRET_KEY, 
    resave: true, 
    saveUninitialized:true
  })
);

initializePassport();
app.use(cookieParser());

//! Rutas de la api
app.use("/api", routes);

//! Ruta de las vistas
app.use("/", viewsRoutes)

const httpServer = app.listen(envsConfig.PORT, () => {
  console.log(`Servidor escuchando en el puerto ${envsConfig.PORT}`);
});

//! Configuramos socket
export const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log("Nuevo usuario Conectado");
});
