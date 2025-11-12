import express from "express";
import { updateUserProfile } from "../../controllers/profileUpdateController.js";
// import { verifyToken } from "../middleware/auth.js";

const profileUpdateRouter = express.Router();
profileUpdateRouter.post("/profile/updateProfile", updateUserProfile);

export default profileUpdateRouter;
