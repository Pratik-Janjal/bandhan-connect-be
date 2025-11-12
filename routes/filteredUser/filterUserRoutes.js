import express from "express";
import { filterUsers } from "../../controllers/filterUserController.js";

const filterRouter = express.Router();

filterRouter.get("/filter", filterUsers);

export default filterRouter;
