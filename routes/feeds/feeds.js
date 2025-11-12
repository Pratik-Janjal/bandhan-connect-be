import express from "express"
import getUserFeed from "../../controllers/feedsController.js";

const feedsRouter = express.Router();

feedsRouter.get("/feeds/:userId", getUserFeed);

export default feedsRouter;