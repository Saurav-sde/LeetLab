# Project Title - A Full-Stack LeetCode Clone

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/YOUR_USERNAME/YOUR_REPO)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A feature-rich platform for practicing coding problems, creating problem playlists, and engaging with a community of developers. This project was built from scratch in one week to demonstrate full-stack development skills.

---

## 🚀 Live Demo

[Link to your deployed project] <-- **Leave this as a placeholder. We will fill it in on the last day.**

---

## 📸 Screenshots & GIFs

*(This section is your top priority as you build the frontend. Every time you finish a page, take a screenshot and add it here! It will feel like progress.)*

| Problem List Page | Problem Detail & Editor | Playlist Creation |
| :---: |:---:|:---:|
| *[Screenshot of your problems table]* | *[Screenshot of your code editor page]* | *[Screenshot of a user's playlist page]* |

---

## 🛠️ Tech Stack

*(Fill this section out right now. It takes 5 minutes and is an easy win.)*

*   **Frontend:** React, Vite, Axios, [MUI / Chakra UI / TailwindCSS], React Router
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (with Mongoose), Redis (for caching/sessions)
*   **Authentication:** JWT (JSON Web Tokens), bcrypt.js, cookie-parser
*   **Deployment:** [Vercel / Netlify for Frontend], [Render / Railway for Backend]

---

## ✨ Features

*(This is the most important section for managing your workload. You will only list what you **actually finish**.)*

### Core Features (Completed)
*   **User Authentication:** Secure user registration and login using JWT.
*   **Problem Solving:** Browse a list of coding problems, view problem details, and submit solutions in a full-featured code editor.
*   **Playlists:** Users can create, update, and delete custom playlists of problems. They can add or remove problems and make playlists public or private.
*   **Public Discovery:** Users can browse all public playlists created by others.

### Future Features (Roadmap)
*   **Discussions:** A community discussion forum for each problem.
*   **Contests:** Timed coding contests with live leaderboards.
*   **Advanced User Profiles:** Profiles showing submission history, stats, and solved problems.

---

## ⚙️ Installation & Setup

To run this project locally, follow these steps:

1.  **Prerequisites:**
    *   Node.js (v18.x or later)
    *   npm / yarn
    *   MongoDB
    *   Redis

2.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
    cd YOUR_REPO
    ```

3.  **Backend Setup:**
    ```bash
    cd backend # or your backend folder name
    npm install
    ```
    Create a `.env` file and add the following environment variables:
    ```
    PORT=8000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    REDIS_URL=your_redis_url
    ```
    Start the backend server:
    ```bash
    npm run dev
    ```

4.  **Frontend Setup:**
    ```bash
    cd frontend # or your frontend folder name
    npm install
    ```
    Create a `.env.local` file and add the API base URL:
    ```
    VITE_API_BASE_URL=http://localhost:8000/api/v1
    ```
    Start the frontend development server:
    ```bash
    npm run dev
    ```

---

## 📄 API Documentation

The API follows RESTful conventions. All routes are prefixed with `/api/v1`.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| **Auth** | | | |
| `POST` | `/auth/register` | Register a new user. | No |
| `POST` | `/auth/login` | Log in a user. | No |
| **Playlists** | | | |
| `GET` | `/playlists` | Get all public playlists. | No |
| `POST` | `/playlists` | Create a new playlist. | Yes |
| `GET` | `/playlists/me` | Get all of the logged-in user's playlists. | Yes |
| `GET` | `/playlists/:id`| Get a single playlist. | No (public) |
| `PATCH`| `/playlists/:id`| Update a playlist. | Yes |
| `DELETE`| `/playlists/:id`| Delete a playlist. | Yes |
| `POST`| `/playlists/:id/problems/:problemId`| Add a problem to a playlist. | Yes |
| `DELETE`| `/playlists/:id/problems/:problemId`| Remove a problem from a playlist. | Yes |
| **Problems** | *(Add more as needed)* | | |
| `GET` | `/problems` | Get all problems. | No |
| `GET` | `/problems/:id` | Get a single problem. | No |

---

## ⚖️ License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.