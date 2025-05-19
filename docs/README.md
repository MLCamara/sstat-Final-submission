#Vercel Deopleyment
https://vercel-deploy-eight-silk.vercel.app/

# SStats (Spotify Stats)

Many Spotify users enjoy tracking their listening habits, but Spotify only provides an annual summary through "Spotify Wrapped." There is no official way for users to access their listening stats dynamically over shorter timeframes. Our project aims to solve this by offering users an interactive website where they can check their top tracks, artists, and genres over the past four weeks, six months, and lifetime.

**Target Browsers**

Any browser can successfully utilize our website. However, it is best recommended to use a desktop.

**Tech used:** HTML, CSS, JavaScript, Spotify Web API, Spotify OAuth 2.0

Our system solves the information problem by providing users with a clean, interactive dashboard to explore their Spotify listening habits. After logging in through secure Spotify OAuth 2.0 authentication, users can view real-time data on their top tracks, artists, and genres. The front end is built with React.js and styled using React-Bootstrap and SCSS, offering a responsive and user-friendly interface. Data visualizations are powered by Recharts for a dynamic experience, while the back end uses Node.js with Express.js to handle API requests and deliver data. User preferences are temporarily stored on the client side using localStorage.


# [Developer Manual](https://github.com/MLCamara/sstat-Final-submission/blob/main/docs/DevManual.md) for `sstats`

Welcome to the developer documentation for `sstats` (Spotify Stats Tracker). This document is intended for future developers who will maintain or build upon this project.

---

## 📦 Installation Guide

### Prerequisites

- Node.js v18+
- npm (Node package manager)
- Git
- A Spotify Developer account (https://developer.spotify.com/dashboard)
- SSL certificates for local HTTPS development:
  - `privkey.pem`
  - `fullchain.pem`

### Clone and Setup

```bash
git clone https://github.com/MLCamara/sstat-Final-submission
cd sstats
npm install

Environment Variables
Create a .env file in the root directory and fill it with:

env

CLIENT_ID=your_spotify_client_id
Running the Application
Development (HTTPS Local Server)
bash

node sptfy.js
This starts an HTTPS server at:
https://127.0.0.1:3000

Make sure privkey.pem and fullchain.pem are present in the root directory for HTTPS to work.

Production Deployment (Recommended)
Use PM2 to run the server persistently:

bash

npm install -g pm2
pm2 start sptfy.js --name sstats
pm2 save
Use Nginx as a reverse proxy to route HTTPS traffic.

Optionally, containerize with Docker in the future.

Running Tests
There are no automated test scripts implemented yet.

To manually test:

Visit /login to authenticate via Spotify.

Check endpoints like:

/profile/:id

/tracks/:id?time_range=short_term

/artists/:id?time_range=medium_term

/genre/:id?time_range=long_term

Use browser DevTools or Postman for API validation.

Server API Reference
Endpoint	Method	Description
/login	GET	Redirects to Spotify authorization page
/callback	GET	Handles Spotify OAuth callback and saves user tokens
/access/:id	GET	Returns access and refresh tokens for a user
/profile/:id	GET	Displays user profile dashboard
/tracks/:id?time_range=term	GET	Displays top tracks for the user in the given range
/artists/:id?time_range=term	GET	Displays top artists for the user in the given range
/genre/:id?time_range=term	GET	Performs genre analysis (currently stubbed)

Note: time_range can be:

short_term = last 4 weeks

medium_term = last 6 months

long_term = last year+

Known Issues
Genre chart functions (createChart, showChart) are stubbed and incomplete.

OAuth token refresh is not implemented — users must re-login if session expires.

Spotify embed iframe occasionally glitches with rapid track switching.

Cards on mobile screens need improved responsive layout.

Roadmap for Future Development
Short-Term
Implement createChart() and showChart() for visualizing top genres

Add token refresh logic to prevent session timeouts

Mid-Term
Add unit tests (e.g., using Jest or Mocha)

Use MongoDB or SQLite to persist user stats and cache responses

Long-Term
Dockerize the app for easier deployment

Add personalized Spotify "year-in-review" reports
