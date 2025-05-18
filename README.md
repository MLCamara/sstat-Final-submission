# SStats (Spotify Stats)

Many Spotify users enjoy tracking their listening habits, but Spotify only provides an annual summary through "Spotify Wrapped." There is no official way for users to access their listening stats dynamically over shorter timeframes. Our project aims to solve this by offering users an interactive website where they can check their top tracks, artists, and genres over the past four weeks, six months, and lifetime.

**Target Browsers**

Any browser can successfully utilize our website. In some of our .ejs coding, we implemented ios as well as mobile support so that the functionality is maintained regardless of user device.

**Tech used:** HTML, CSS, JavaScript, Spotify Web API, Spotify OAuth 2.0

Our system solves the information problem by providing users with a clean, interactive dashboard to explore their Spotify listening habits. After logging in through secure Spotify OAuth 2.0 authentication, users can view real-time data on their top tracks, artists, and genres. The front end is built with React.js and styled using React-Bootstrap and SCSS, offering a responsive and user-friendly interface. Data visualizations are powered by Recharts for a dynamic experience, while the back end uses Node.js with Express.js to handle API requests and deliver data. User preferences are temporarily stored on the client side using localStorage.

