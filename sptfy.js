import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import https from "https";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import * as auth from "./api/auth.js";

const app = express();
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const clientId = process.env.CLIENT_ID;
const redirectUri = "https://127.0.0.1:3000/callback";
const scope =
  "user-top-read user-read-recently-played user-read-private user-read-email";
const port = 3000;
let database = {};

const options = {
  key: fs.readFileSync(path.join(__dirname, "privkey.pem")),
  cert: fs.readFileSync(path.join(__dirname, "fullchain.pem")),
};
// Set EJS as the templating engine
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

async function getToken(code) {
  const url = "https://accounts.spotify.com/api/token";
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: auth.codeVerifier,
    }),
  };

  const body = await fetch(url, payload);
  const response = await body.json();
  console.log(response);
  return response;
}

app.get("/", async function (req, res) {
  res.render("index");
});

app.get("/callback", async function (req, res) {
  try {
    const urlParams = new URLSearchParams(req.query);
    let code = urlParams.get("code");

    if (!code) {
      console.log("No Token Found.");
      return res.redirect("/");
    }
    console.log(` Code: ${code}`);

    // Wait for the token response
    let result = await getToken(code);
    let token = result.access_token;
    let refresh = result.refresh_token;
    let id = await getId(token); // Ensure getId is also async

    let data = {
      access_token: token,
      refresh_token: refresh,
      id: id,
    };
    database[id] = data;
    let test = getId(token);
    // Redirect based on result
    if (test) {
      return res.redirect(`/profile/${id}`);
    } else {
      delete database.id;
      return res.redirect("/");
    }
  } catch (error) {
    console.error("Error in callback:", error);
    res.redirect("/");
  }
});

app.get("/login", async function (req, res) {
  console.log("Code Challenge: " + auth.codeChallenge);
  console.log("Code Verifier: " + auth.codeVerifier);
  const authUrl = new URL("https://accounts.spotify.com/authorize");
  const params = {
    response_type: "code",
    client_id: clientId,
    scope,
    code_challenge_method: "S256",
    code_challenge: auth.codeChallenge,
    redirect_uri: redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();
  res.redirect(authUrl.toString());
});

app.get("/access/:id", function (req, res) {
  const id = req.params.id;
  const data = database[id];
  if (data) {
    res.json(data); // Return the data if it exists
  } else {
    res.status(404).send("Not found"); // Return a 404 error if not found
  }
});

app.get("/profile/:id", function (req, res) {
  const id = req.params.id;
  if (id in database) {
    res.render("profile");
  } else {
    res.redirect("/");
  }
});

app.get("/tracks/:id", function (req, res) {
  const id = req.params.id;
  const timeRange = req.query.time_range; // "short_term"

  if (id in database) {
    res.render("tracks", { id, timeRange }); // pass to EJS or template if needed
  } else {
    res.redirect("/");
  }
});

app.get("/artists/:id", function (req, res) {
  const id = req.params.id;
  const timeRange = req.query.time_range; // will be "short_term"

  if (id in database) {
    res.render("artists", { id, timeRange }); // optional: pass values to the template
  } else {
    res.redirect("/");
  }
});
app.get("/genre/:id", function (req, res) {
  const id = req.params.id; // will be "short_term"
  const timeRange = req.query.time_range;
  if (id in database) {
    res.render("genre", { id, timeRange }); // optional: pass values to the template
  } else {
    res.redirect("/");
  }
});

async function getId(token) {
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      return null; // Return null for clarity instead of 0
    }

    const data = await response.json(); // Properly declare `data`
    return data.id; // Access the 'id' key correctly
  } catch (error) {
    console.error("Error fetching Spotify ID:", error);
    return null;
  }
}

https.createServer(options, app).listen(port, "127.0.0.1", () => {
  console.log(`Server running on https://127.0.0.1:${port}`);
});
