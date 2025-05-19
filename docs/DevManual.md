# Developer Manual

## 1. Installation

**Requirements**
Node.js v18+
npm (comes with Node.js)
A Spotify Developer account
SSL certificate files (privkey.pem, fullchain.pem)
EJS and Bootstrap (already integrated)

**Steps**
'''bash
git clone https://github.com/MLCamara/sstat-Final-submission
cd sstats
npm install

Environment Variables
Create a .env file (already provided) in the root directory:
env

CLIENT_ID=your_spotify_client_id

CLIENT_SECRET=your_spotify_client_secret

SESSION_SECRET=any_secure_string


## 2. Running the App
Local HTTPS Server
bash
CopyEdit
node sptfy.js

Runs the app on:
 https://127.0.0.1:3000
Requires:
privkey.pem and fullchain.pem in the root directory (for HTTPS)

## 3. Running Tests
As of now, no formal tests are defined. Recommended manual testing steps:
Navigate to /login to initiate Spotify OAuth


After redirect, use /profile/:id, /tracks/:id?time_range=short_term, etc. to verify user data display


Use browser dev tools or Postman to hit:

/access/:id

/artists/:id?time_range=medium_term

/genre/:id?time_range=long_term



## 4. API Reference
GET Endpoints
/login; Begins Spotify OAuth 2.0 login

/callback; OAuth redirect handler (saves tokens)

/access/:id; Returns saved access_token + refresh_token

/profile/:id; Loads profile page for the user

/tracks/:id?time_range=range; Shows top tracks over selected time range

/artists/:id?time_range=range; Shows top artists over selected time range

/genre/:id?time_range=range; Analyzes top genres (future implementation)


## 5. Known Bugs
OAuth Refresh Token Logic Not Implemented: If token expires, user must re-auth

Responsive Styling: Layout may shift on mobile for cards


Spotify Embed Glitch: Clicking multiple tracks quickly can break iframe state


Genre Chart: Genre analysis/chart functions are stubbed and incomplete


## 6. Roadmap
**Short-Term**

Implement genre-based analytics using createChart() and showChart()


Add token refresh logic


Improve mobile responsiveness


**Mid-Term**

Add Jest/Mocha test suite


Implement database storage (MongoDB or SQLite) for caching stats


Use session middleware for better state handling

