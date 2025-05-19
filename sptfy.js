// Import required modules
import dotenv from "dotenv"; // Loads environment variables from .env file
import express from "express"; // Express framework for creating the server
import fs from "fs"; // File system module for reading SSL certificates
import https from "https"; // HTTPS module to create secure server
import path, { dirname } from "path"; // Path utilities
import { fileURLToPath } from "url"; // Helps convert import.meta.url to file path
import * as auth from "./auth.js"; // Custom module handling PKCE auth

// Initialize Express app
const app = express();
dotenv.config(); // Load environment variables

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Spotify configuration
const clientId = process.env.CLIENT_ID; // Spotify Client ID from environment variables
const redirectUri = "https://127.0.0.1:3000/callback"; // Redirect URI after Spotify login
const scope =
  "user-top-read user-read-recently-played user-read-private user-read-email"; // Permissions being requested

const port = 3000; // Port to run server
let database = {}; // Temporary in-memory database to store tokens per user

// HTTPS server credentials (certificate and private key)
const options = {
  key: fs.readFileSync(path.join(__dirname, "privkey.pem")),
  cert: fs.readFileSync(path.join(__dirname, "fullchain.pem")),
};

// Set up view engine and static/public middleware
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Function to exchange code for access and refresh tokens
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
  console.log(response); // Log token response for debugging
  return response;
}

// Home page route
app.get("/", async function (req, res) {
  res.render("index");
});

// Callback route after Spotify login
app.get("/callback", async function (req, res) {
  try {
    const urlParams = new URLSearchParams(req.query);
    let code = urlParams.get("code");

    if (!code) {
      console.log("No Token Found.");
      return res.redirect("/");
    }
    console.log(` Code: ${code}`);

    // Exchange code for tokens
    let result = await getToken(code);
    let token = result.access_token;
    let refresh = result.refresh_token;

    let id = await getId(token); // Get user's Spotify ID

    // Store tokens and ID in temporary database
    let data = {
      access_token: token,
      refresh_token: refresh,
      id: id,
    };
    database[id] = data;

    let test = getId(token); // Re-check ID (should probably be `await`ed)

    // Redirect to profile page if ID retrieval successful
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

// Route to initiate login with Spotify (PKCE flow)
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
  res.redirect(authUrl.toString()); // Redirect to Spotify login
});

// API endpoint to retrieve access/refresh token data by user ID
app.get("/access/:id", function (req, res) {
  const id = req.params.id;
  const data = database[id];
  if (data) {
    res.json(data); // Return user data if it exists
  } else {
    res.status(404).send("Not found"); // Otherwise, return 404
  }
});

// Render user profile page if authenticated
app.get("/profile/:id", function (req, res) {
  const id = req.params.id;
  if (id in database) {
    res.render("profile");
  } else {
    res.redirect("/");
  }
});

// Render top tracks page based on time range query
app.get("/tracks/:id", function (req, res) {
  const id = req.params.id;
  const timeRange = req.query.time_range;

  if (id in database) {
    res.render("tracks", { id, timeRange });
  } else {
    res.redirect("/");
  }
});

// Render top artists page based on time range query
app.get("/artists/:id", function (req, res) {
  const id = req.params.id;
  const timeRange = req.query.time_range;

  if (id in database) {
    res.render("artists", { id, timeRange });
  } else {
    res.redirect("/");
  }
});

// Render genre breakdown page based on time range query
app.get("/genre/:id", function (req, res) {
  const id = req.params.id;
  const timeRange = req.query.time_range;

  if (id in database) {
    res.render("genre", { id, timeRange });
  } else {
    res.redirect("/");
  }
});

// Helper function to get user's Spotify ID using access token
async function getId(token) {
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error fetching Spotify ID:", error);
    return null;
  }
}

// Start HTTPS server
https.createServer(options, app).listen(port, "127.0.0.1", () => {
  console.log(`Server running on https://127.0.0.1:${port}`);
});
