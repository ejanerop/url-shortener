require("dotenv").config();
const bodyparser = require("body-parser");
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const fs = require("fs");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", function (req, res) {
  const url = req.body.url;

  if (!(url.startsWith("http://") || url.startsWith("https://"))) {
    res.json({error: "invalid url"});
  }

  try {
    const urlObject = new URL(url);

    let urlsFile = fs.readFileSync("url.json");
    let urls = JSON.parse(urlsFile);

    dns.lookup(urlObject.hostname, (err, address) => {
      if (err) {
        res.json({error: "invalid url"});
      } else {
        let shortenedURL = Math.floor(Math.random() * 100000).toString();
        urls[shortenedURL] = url;
        fs.writeFileSync("url.json", JSON.stringify(urls));
        res.json({original_url: url, short_url: shortenedURL});
      }
    });
  } catch (error) {
    res.json({error: "invalid url"});
  }
});

app.get("/api/shorturl/:short_url", function (req, res) {
  const short_url = req.params.short_url;
  let urlsFile = fs.readFileSync("url.json");
  let urls = JSON.parse(urlsFile);
  if (urls[short_url]) {
    res.redirect(urls[short_url]);
  } else {
    res.json({error: "invalid url"});
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
