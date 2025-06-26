const express = require('express');
const playlistRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const {createPlaylist, deletePlaylist, updatePlaylist, getPlaylist, addProblem, deleteProblem, getAllPublicPlaylist, getMyPlaylist} = require('../controllers/userPlaylist');

playlistRouter.post("/create",userMiddleware,createPlaylist);
playlistRouter.delete("/delete/:playlistId",userMiddleware,deletePlaylist);
playlistRouter.patch("/update/:playlistId",userMiddleware,updatePlaylist);
playlistRouter.get("/:playlistId",userMiddleware,getPlaylist);

playlistRouter.post("/:playlistId/problems/:problemId", userMiddleware, addProblem);
playlistRouter.delete("/:playlistId/problems/:problemId", userMiddleware, deleteProblem);

playlistRouter.get("/getAllPublicPlaylist", userMiddleware, getAllPublicPlaylist);
playlistRouter.get("/getAllPlaylist", userMiddleware, getMyPlaylist);

module.exports = playlistRouter;