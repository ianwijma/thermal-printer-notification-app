const  { NetworkInterfaceInfo, networkInterfaces } = require("os");
const  express = require("express");
const  { DEFAULT_PORT, CONNECTION_STRING } = require("../common/constants");
const  { nanoid } = require("nanoid");
const  bodyParser = require("body-parser");
const  jwt = require("jsonwebtoken");
const {getPrinter} = require("./utils/printer");

const app = express();
app.use(bodyParser.json());

const getRequestId = (request) => {
  return request.socket.remoteAddress;
};

const displayMessage = async (message) => {
  (await getPrinter())
      .text('-----------------------')
      .text(message)
      .text('-----------------------')
      .feed()
      .feed()
      .feed()
      .cut()
      .close()
}

app.get("/ping", async (req, res) => {
  res.send(CONNECTION_STRING);
  displayMessage('MEMES!~')
});

const codes = {};

app.get("/create-code", async (req, res) => {
  const clientIp = getRequestId(req);
  if (clientIp) {
    let code;
    if (clientIp in codes) {
      code = codes[clientIp];
    } else {
      code = await nanoid(3);
      codes[clientIp] = code;
    }
    console.log(`Client code: ${code}`);
    res.send("done");
  } else {
    res.statusCode = 400;
    res.send("Unknown client ip");
  }
});

const SECRET = "ThisIsSomeAmazingSecret";

app.post("/validate-code", (req, res) => {
  const clientIp = getRequestId(req);
  const { code = false } = req.body;
  if (clientIp && code && code === codes[clientIp]) {
    const token = jwt.sign(
      {
        expectedIp: clientIp,
      },
      SECRET
    );
    console.log(`jwt: ${token}`);
    res.send(token);
  } else {
    res.statusCode = 400;
    res.send("Incorrect code");
  }
});

app.post("/validate", async (req, res) => {
  const clientIp = getRequestId(req);
  const { token = false } = req.body;
  if (token) {
    try {
      const payload = jwt.verify(token, SECRET);
      const { expectedIp } = payload;
      if (expectedIp === clientIp) {
        res.send("Success!");
      } else {
        res.statusCode = 401;
        res.send("Client ip does not matches expected ip");
      }
    } catch (err) {
      res.statusCode = 401;
      res.send(err);
    }
  } else {
    res.statusCode = 400;
    res.send("Token missing");
  }
});

app.listen(DEFAULT_PORT, () => {
  console.log("Accessable from the following ports:");
  const interfaces = networkInterfaces();
  Object.values(interfaces).forEach((interfaceLinks) => {
    if (interfaceLinks) {
      interfaceLinks.forEach((link) => {
        const { family, address, internal } = link;
        if (!internal && family === "IPv4") {
          console.log(`\t- ${address}:${DEFAULT_PORT}`);
        }
      });
    }
  });
});
