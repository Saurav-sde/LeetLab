const Playlist = require("../models/playlist");

// create a new playlist
const createPlaylist = async (req, res) => {
    const { name, description, isPublic } = req.body;
    const playlistCreator = req.result._id;

    try {
        const playlist = await Playlist.create({
            name,
            description,
            isPublic,
            playlistCreator,
            problems: [] 
        });

        res.status(201).json(playlist);

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        console.error("Error creating playlist:", err); 
        res.status(500).json({ message: "Server error: Failed to create the playlist." });
    }
}

// delete any existing playlist
const deletePlaylist = async (req,res) => {
    const {playlistId} = req.params;
    const userId = req.result._id;

    try {
        if(!playlistId)
            return res.status(400).json({message: "playlist is missing"});

        const deletedPlaylist = await Playlist.findOneAndDelete({
            _id: playlistId,
            playlistCreator: userId
        });

        if(!deletedPlaylist)
            return res.status(404).json({message: "playlist not found or you do not have permission to delete it"});

        res.status(200).json({message: "Playlist deleted successfully"});
    } catch (error) {
        res.status(500).json({ message: "Server error: Failed to delete the playlist." + error.message })
    }
}

// get a specified playlist
const getPlaylist = async (req,res) => {
    const {playlistId} = req.params;
    const userId = req.result._id;

    try {
        if(!playlistId)
            return res.status(404).json({message: "playlist id is missing"});

        const playlist = await Playlist.findById(playlistId)
            .populate({path: 'problems', select: 'title difficulty tags'})
            .populate({path: 'playlistCreator', select: 'username'});

        if(!playlist)
            return res.status(404).json({message: "playlist not found"});

        if(!playlist.isPublic && playlist.playlistCreator._id.toString() !== userId?.toString())
            return res.status(404).json({message: "playlist not found"});

        res.status(200).json(playlist);
    } catch (err) {
        res.status(500).json({message: "Server error: Failed to fetch the playlist. " + err});
    }
}


// modify any playlist
const updatePlaylist = async (req,res) => {
    const {playlistId} = req.params;
    const userId = req.result._id;
    
    try {
        if(!playlistId)
            return res.status(404).json({message: "playlist id is missing"});

        const playlist = await Playlist.findById(playlistId);

        if(!playlist)
            return res.status(404).json({message: 'playlist not found'});

        if(!playlist.playlistCreator.equals(userId))
            return res.status(404).json({message: 'playlist not found or you do not have permission to modify it'});

        const {name, description, isPublic} = req.body;
        const updateData = {};
        if(name)
            updateData.name = name;
        if(description)
            updateData.description = description;
        if(isPublic !== undefined)
            updateData.isPublic = isPublic;

        if(Object.keys(updateData).length === 0)
            return res.status(400).json({message: "No valid fields provided for the update"})

        const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {$set: updateData}, {new: true, runValidators: true} );

        res.status(200).json(updatedPlaylist);
    } catch (err) {
        res.status(500).json({ message: "Server error: Failed to update the playlist." + err});
    }
}

// add a new problem to a playlist
const addProblem = async (req,res) => {
    const {problemId, playlistId} = req.params;
    const userId = req.result._id;

    try {
        if(!problemId)
            return res.status(404).json({message: 'problem is missing'});

        if(!playlistId)
            return res.status(404).json({message: 'playlist is missing'});

        const updatedPlaylist = await Playlist.findOneAndUpdate(
            {_id: playlistId, playlistCreator: userId},
            { $addToSet: {problems: problemId}},
            {new: true, runValidators: true}
        );

        if(!updatedPlaylist)
            return res.status(404).json({message: 'Playlist not found or you do not have permission to modify it'});

        res.status(200).json(updatedPlaylist);
    } catch (err) {
        res.status(500).json({message: 'Server error: Failed to add problem to the playlist.'});
    }
}

// remove a problem from a playlist
const deleteProblem = async (req,res) => {
    const {playlistId, problemId} = req.params;
    const userId = req.result._id;

    try {
        if(!problemId)
            return res.status(404).json({message: 'problem is missing'});

        if(!playlistId)
            return res.status(404).json({message: 'playlist is missing'});

        const updatedPlaylist = await Playlist.findOneAndUpdate(
            {_id: playlistId, playlistCreator: userId},
            {$pull: {problems: problemId}},
            {new:true, runValidators: true}
        )

         if (!updatedPlaylist) {
            return res.status(404).json({ message: 'Playlist not found or you do not have permission to modify it.' });
        }

        res.status(200).json(updatedPlaylist);
    } catch (err) {
        res.status(500).json({message: 'Server error: Failed to remove problem from the playlist.'});
    }
}

// fetch all the public playlists
const getAllPublicPlaylist = async (req,res) => {
    try {
        const allPlaylists = await Playlist.find({isPublic: true});
        res.status(200).json(allPlaylists);

    } catch (err) {
        console.error("Error fetching public playlists:", err);
        res.status(500).json({ message: "Server error: Failed to fetch playlists." });
    }
}

// fetch all the playlists created by the user(my playlist)
const getMyPlaylist =  async (req,res) => {
    const userId = req.result._id;

    try {
        if(!userId)
            return res.status(404).json({message: 'user is missing'});

        const playlists = await Playlist.find({playlistCreator: userId});

        res.status(200).json(playlists);
    } catch (err) {
        console.error("Error fetching public playlists:", err);
        res.status(500).json({ message: "Server error: Failed to fetch playlists." });
    }
}

module.exports = {createPlaylist, deletePlaylist, updatePlaylist, getPlaylist, addProblem, deleteProblem, getAllPublicPlaylist, getMyPlaylist};