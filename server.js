import { Contenedor, Product } from "./controllers/index.js";
import { Chat, Message } from "./controllers/messages.js";
import express from "express";
import handlebars from "express-handlebars";
import {Server as HTTPServer} from "http";
import{Server as SocketServer} from "socket.io";

const app = express();
const httpServer= new HTTPServer(app);
const io= new SocketServer(httpServer)


//Configuro motor de plantillas
app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: "index.hbs"
  })
);

//Seteo motor de plantillas y carpeta contenedora
app.set("view engine", "hbs");
app.set("views", "./public/views");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



////Instancio la clase
const productos = new Contenedor(); 
let producto1= new Product("Cargador",2500,"https://cdn4.iconfinder.com/data/icons/web-essential-4/64/31-web_essential-128.png")
let producto2= new Product("Mouse",1000,"https://cdn3.iconfinder.com/data/icons/computer-51/100/computer_10-128.png")
let producto3= new Product("Monitor",7000,"https://cdn4.iconfinder.com/data/icons/multimedia-75/512/multimedia-37-128.png")
productos.save(producto1);
productos.save(producto2);
productos.save(producto3);

let chat= new Chat("messages");

io.on("connection", async (socket)=>{
  console.log("Nuevo cliente conectado");
  socket.server.emit("RENDER_PRODUCTS", productos.getAll());
  socket.server.emit("RENDER_CHAT", await chat.getall());

  socket.on("ADD_PRODUCT", (product)=>{
    productos.save(product);
    io.sockets.emit("RENDER_PRODUCTS",productos.getAll());  
  });

  socket.on("ADD_MESSAGE", async(message)=>{
    const newMessage= new Message(message.email, message.text);
    console.log(newMessage);
    await chat.addMessage(newMessage);
    
    socket.server.emit("RENDER_CHAT", await chat.getall());
  });

});

const PORT = 8080;
const srv = httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${srv.address().port}`);
});
srv.on("error", (error) => console.log(`Error en el servidor: ${error}`));
