const router = require("express").Router();
const Movie = require("../models/Movie");

router.get("/movies", async(req, res) => {
    try{
       const page = parseInt(req.query.page) - 1 || 0;
       const limit = parseInt(req.query.limit) || 5;
       const search = req.query.search || "";
       let sort = req.query.sort || "rating";
       let genre = req.query.genre || "All";
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: true, message: "Internal Server Error"});
    }
});

module.exports = router;