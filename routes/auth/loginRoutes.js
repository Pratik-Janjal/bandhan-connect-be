import express from "express";
import loginUser  from "../../controllers/loginController.js";

const loginRouter = express.Router();

loginRouter.post("/login", loginUser);

export default loginRouter;
