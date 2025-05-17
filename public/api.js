let token;
let range;
function getToken() {
  token = window.localStorage.getItem("access_token");
}

async function getUserInfo() {
  let data = await fetchUserData();
  if (data) {
    let pfp = data["images"][0].url;
    let img = document.getElementById("pfp");

    let username = data["display_name"];
    let followers = data["followers"]["total"];
    let url = data["external_urls"]["spotify"];

    img.src = pfp;

    document.getElementById("username").innerText = username;
    document.getElementById("username").href = url;
    document.getElementById("followers").innerText = `${followers} Followers`;
  } else {
    console.log("Unable to retrieve");
  }
}

async function fetchUserData() {
  let response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    console.error(`Error: ${response.status} ${response.statusText}`);
    return 0;
  } else {
    let data = await response.json();
    console.log(data);
    return data;
  }
}

async function fetchRecent() {
  let response = await fetch(
    "https://api.spotify.com/v1/me/player/recently-played?limit=10",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    console.error(`Error: ${response.status} ${response.statusText}`);
    return 0;
  } else {
    data = await response.json();
    console.log(data);
    return data["items"];
  }
}

async function getRecent() {
  let items = await fetchRecent();
  let i = 1;
  items.forEach((item) => {
    let artist = item["track"]["artists"][0]["name"];
    let track = item["track"]["name"];
    let image = item["track"]["album"]["images"][1]["url"];
    let uri = item["track"]["uri"];
    let recentPlayed = document.getElementById(`rp${i}`);
    recentPlayed.querySelector("img").src = image;
    recentPlayed.querySelector("h3").textContent = track;
    recentPlayed.querySelector("p").textContent = artist;
    recentPlayed
      .querySelector("button")
      .setAttribute("data-spotify-uri", `${uri}`);
    i++;
  });
}

async function fetchTracks() {
  let response = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?time_range=${range}&limit=30`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    console.error(`Error: ${response.status} ${response.statusText}`);
    return 0;
  } else {
    data = await response.json();
    console.log(data);
    return data;
  }
}

async function getTracks() {
  let i = 1;
  data = await fetchTracks();
  items = data["items"];
  items.forEach((item) => {
    let artist = item["artists"][0]["name"];
    let track = item["name"];
    let url_artist = item["artists"][0]["url"];
    let image = item["album"]["images"][1]["url"];
    let uri = item["uri"];
    let recentPlayed = document.getElementById(`tt${i}`);
    recentPlayed.querySelector("img").src = image;
    recentPlayed.querySelector("h3").textContent = track;
    recentPlayed.querySelector("p").textContent = artist;
    recentPlayed
      .querySelector("button")
      .setAttribute("data-spotify-uri", `${uri}`);
    i++;
  });
}

async function fetchArtists() {
  let response = await fetch(
    `https://api.spotify.com/v1/me/top/artists?time_range=${range}&limit=30`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    console.error(`Error: ${response.status} ${response.statusText}`);
    return 0;
  } else {
    data = await response.json();
    console.log(data);
    return data;
  }
}

async function getArtists() {
  let i = 1;
  let data = await fetchArtists();
  let items = data["items"];
  items.forEach((item) => {
    let artist = item["name"];
    let score = item["popularity"];
    let image = item["images"][1]["url"];
    let recentPlayed = document.getElementById(`ta${i}`);
    recentPlayed.querySelector("img").src = image;
    recentPlayed.querySelector("h3").textContent = artist;
    recentPlayed.querySelector("p").textContent = `Popularity: ${score}`;
    i++;
  });
}

async function analysis() {
  let i = 0;
  let data = await fetchArtists();
  let genre = {};
  items = data["items"];
  items.forEach(async (item) => {
    if (Object.keys(item["genres"]).length > 0) {
      let genres = item["genres"];
      console.log(genres);
      //todo
      i++;
    }
  });
}

async function createChart() {}
async function showChart() {}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("id");
  window.location.href = "/";
}

window.onload = function () {
  const path = window.location.pathname;

  if (path === "/profile" || path.startsWith("/profile/")) {
    getToken();
    getUserInfo();
    getRecent();
  }

  if (path.startsWith("/artists")) {
    const params = new URLSearchParams(window.location.search);
    range = params.get("time_range") || "medium_term"; // default to medium_term if not provided

    switch (range) {
      case "short_term":
        term.textContent = "Last 4 Weeks";
        break;
      case "medium_term":
        term.textContent = "Last 6 Months";
        break;
      case "long_term":
        term.textContent = "Last Year";
        break;
    }

    getToken();
    getArtists(range);
  }

  if (path.startsWith("/tracks")) {
    const params = new URLSearchParams(window.location.search);
    range = params.get("time_range") || "medium_term"; // default to medium_term if not provided

    switch (range) {
      case "short_term":
        term.textContent = "Last 4 Weeks";
        break;
      case "medium_term":
        term.textContent = "Last 6 Months";
        break;
      case "long_term":
        term.textContent = "Last Year";
        break;
    }

    getToken();
    getTracks(range);
  }

  if (path.startsWith("/genre")) {
    const params = new URLSearchParams(window.location.search);
    range = params.get("time_range") || "medium_term";

    switch (range) {
      case "short_term":
        term.textContent = "Last 4 Weeks";
        break;
      case "medium_term":
        term.textContent = "Last 6 Months";
        break;
      case "long_term":
        term.textContent = "Last Year";
        break;
    }
    getToken();
    analysis();
    createChart();
    showChart();
  }
};
