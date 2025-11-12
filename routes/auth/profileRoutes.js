import express from "express";
import multer from "multer";

import {
  addProfileInfo,
  addBio,
  addPhotos,
  setPartnerPreferences,
} from "../../controllers/profileController.js";

const profileRouter = express.Router();
const upload = multer({dest : "upload/"})

profileRouter.post("/info", addProfileInfo);
profileRouter.post("/bio", addBio);
profileRouter.post("/add-photos",upload.array("photos",5), addPhotos);
profileRouter.post("/partner-preferences", setPartnerPreferences);

export default profileRouter;
