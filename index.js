// Import required modules
import dotenv from "dotenv"; // Loads environment variables from .env file
import express from "express"; // Express framework for creating the server
import path, { dirname } from "path"; // Path utilities
import { fileURLToPath } from "url"; // Helps convert import.meta.url to file path
import * as auth from "./auth.js"; // Custom module handling PKCE auth
import { connectDB } from "./db.js";

// Initialize Express app
const app = express();
dotenv.config(); // Load environment variables
// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Spotify configuration
const clientId = process.env.CLIENT_ID; // Spotify Client ID from environment variables
const redirectUri = "https://vercel-deploy-eight-silk.vercel.app/callback"; // Redirect URI after Spotify login
const scope =
  "user-top-read user-read-recently-played user-read-private user-read-email"; // Permissions being requested

const port = 3000; // Port to run server
// Temporary in-memory database to store tokens per user

// Set up view engine and static/public middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
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

app.get("/callback", async function (req, res) {
  try {
    const urlParams = new URLSearchParams(req.query);
    let code = urlParams.get("code");

    if (!code) {
      console.log("No Token Found.");
      return res.redirect("/");
    }
    console.log(`Code: ${code}`);

    // Exchange code for tokens
    let result = await getToken(code);
    let token = result.access_token;
    let refresh = result.refresh_token;

    let id = await getId(token); // Get user's Spotify ID
    const db = await connectDB();
    const collection = db.collection("data");
    await collection.updateOne(
      { id }, // Find by ID
      {
        $set: {
          access_token: token,
          refresh_token: refresh,
          id: id,
        },
      },
      { upsert: true } // Insert if it doesn't exist
    );

    // Redirect to profile page if ID retrieval successful
    if (id) {
      return res.redirect(`/profile/${id}`);
    } else {
      await collection.deleteOne({ id }); // Remove if bad
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


app.get("/access/:id", async function (req, res) {
  try {
    const db = await connectDB();
    const collection = db.collection("data");
    const id = req.params.id;
    const data = await collection.findOne({ id });

    if (data) {
      res.json(data); // Return user data if found in DB
    } else {
      res.status(404).send("Not found"); // Return 404 if not found
    }
  } catch (error) {
    console.error("Error fetching access token:", error);
    res.status(500).send("Server error");
  }
});


// Render user profile page if authenticated
app.get("/profile/:id", async function (req, res) {
  const id = req.params.id;
  try {
    const db = await connectDB();
    const collection = db.collection("data");

    const user = await collection.findOne({ id });

    if (user) {
      res.render("profile", { id });  // optionally pass data
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error("Error loading profile:", err);
    res.redirect("/");
  }
});

// Render top tracks page based on time range query
app.get("/tracks/:id",  async function (req, res) {
  const id = req.params.id;
  const timeRange = req.query.time_range;
   try {
    const db = await connectDB();
    const collection = db.collection("data");

    const user = await collection.findOne({ id });

    if (user) {
      res.render("tracks", { id, timeRange}); 
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error("Error loading tracks:", err);
    res.redirect("/");
  }
});

// Render top artists page based on time range query
app.get("/artists/:id", async function (req, res) {
  const id = req.params.id;
  const timeRange = req.query.time_range;
   try {
    const db = await connectDB();
    const collection = db.collection("data");

    const user = await collection.findOne({ id });

    if (user) {
      res.render("artists", { id, timeRange}); 
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error("Error loading artists:", err);
    res.redirect("/");
  }
});

// Render genre breakdown page based on time range query
app.get("/genre/:id", async function (req, res) {
  const id = req.params.id;
  const timeRange = req.query.time_range;
   try {
    const db = await connectDB();
    const collection = db.collection("data");

    const user = await collection.findOne({ id });

    if (user) {
      res.render("genre", { id, timeRange});  
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error("Error loading genres:", err);
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

app.listen(port, () => {
  console.log(`server running 127.0.0.1:${port}`);
});
