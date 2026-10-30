import express from "express";
import { getUser, login, register } from "../controllers/authController.js";
import auth from "../middleware/auth.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user", auth, getUser)

export default router;