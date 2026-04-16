import express from "express";
import {
  signUpController,
  loginController,
} from "../controllers/usersController.js";
import { tokenValidator } from "../middlewares/tokenValidator.js";

const router = express();

router.post("/signup", signUpController);
router.post("/login", loginController);
router.get("/protectedRoute", tokenValidator, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

export default router;
