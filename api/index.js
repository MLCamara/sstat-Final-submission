// File: api/index.js

import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import path, { dirname } from "path";
import serverless from "serverless-http";
import { fileURLToPath } from "url";
import auth from "./auth.js";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const clientId = process.env.CLIENT_ID;
const redirectUri = "https://sstat-final-submission.vercel.app/callback";
const scope =
  "user-top-read user-read-recently-played user-read-private user-read-email";

let memoryStore = {}; // Not persistent between requests in Vercel

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../public")));
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
  return await body.json();
}

async function getId(token) {
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error fetching Spotify ID:", error);
    return null;
  }
}

app.get("/", (req, res) => {
  res.send("Hello");
  res.render("index");
});

app.get("/login", (req, res) => {
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

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect("/");

  const result = await getToken(code);
  const token = result.access_token;
  const refresh = result.refresh_token;
  const id = await getId(token);

  if (!id) return res.redirect("/");

  memoryStore[id] = { access_token: token, refresh_token: refresh };
  res.redirect(`/profile/${id}`);
});

app.get("/access/:id", (req, res) => {
  const data = memoryStore[req.params.id];
  if (data) res.json(data);
  else res.status(404).send("Not found");
});

app.get("/profile/:id", (req, res) => {
  if (req.params.id in memoryStore) res.render("profile");
  else res.redirect("/");
});

app.get("/tracks/:id", (req, res) => {
  if (req.params.id in memoryStore)
    res.render("tracks", {
      id: req.params.id,
      timeRange: req.query.time_range,
    });
  else res.redirect("/");
});

app.get("/artists/:id", (req, res) => {
  if (req.params.id in memoryStore)
    res.render("artists", {
      id: req.params.id,
      timeRange: req.query.time_range,
    });
  else res.redirect("/");
});

app.get("/genre/:id", (req, res) => {
  if (req.params.id in memoryStore)
    res.render("genre", { id: req.params.id, timeRange: req.query.time_range });
  else res.redirect("/");
});

export default serverless(app);
