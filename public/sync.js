const url = window.location.href;
const id = url.split("/")[4];
async function sync() {
  try {
    // Fetch data from /access/:id
    let response = await fetch(`https://127.0.0.1:3000/access/${id}`);
    if (!response.ok) {
      throw new Error("Failed to retrieve data");
    }
    let data = await response.json();

    let token = data["access_token"];
    let refresh = data["refresh_token"];

    // Store tokens and ID in localStorage
    if (token && refresh) {
      window.localStorage.setItem("access_token", token);
      window.localStorage.setItem("refresh_token", refresh);
      window.localStorage.setItem("id", id);
    } else {
      throw new Error("Token or refresh token not found");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
sync();
