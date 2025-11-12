import express from "express";
import getUserProfile from "../../controllers/profilesController.js";

const profilesRouter = express.Router();

// ✅ GET user profile by ID
profilesRouter.get("/profile/:userId", getUserProfile);

export default profilesRouter;
