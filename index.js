import express from "express";
import http from "node:http";
import path from "node:path";
import { createBareServer } from "@tomphttp/bare-server-node";
import { hostname } from "node:os";

const __dirname = process.cwd();
const server = http.createServer();
const app = express(server);
const bareServer = createBareServer("/bare/");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.static(path.join(__dirname, "static")));
app.get('/app', (req, res) => {
  res.sendFile(path.join(process.cwd(), './static/app.html'));
});
app.get('/student', (req, res) => {
  res.sendFile(path.join(process.cwd(), './static/loader.html'));
});
app.get('/apps', (req, res) => {
  res.sendFile(path.join(process.cwd(), './static/apps.html'));
});
app.get('/gms', (req, res) => {
  res.sendFile(path.join(process.cwd(), './static/gms.html'));
});
app.get('/lessons', (req, res) => {
  res.sendFile(path.join(process.cwd(), './static/agloader.html'));
});
app.get('/credits', (req, res) => {
  res.sendFile(path.join(process.cwd(), './static/credits.html'));
});
app.get('/partners', (req, res) => {
  res.sendFile(path.join(process.cwd(), './static/partners.html'));
});
app.use((req, res) => {
  res.statusCode = 404;
  res.sendFile(path.join(process.cwd(), './static/404.html'))
});

server.on("request", (req, res) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 80;

server.on("listening", () => {
  const address = server.address();

  // by default we are listening on 0.0.0.0 (every interface)
  // we just need to list a few
  console.log("Listening on:");
  console.log(`\thttp://localhost:${address.port}`);
  console.log(`\thttp://${hostname()}:${address.port}`);
  console.log(
    `\thttp://${
      address.family === "IPv6" ? `[${address.address}]` : address.address
    }:${address.port}`
  );
});

// https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html
process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)

function shutdown() {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
}

server.listen({
  port,
});