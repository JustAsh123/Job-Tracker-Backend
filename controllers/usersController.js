import bcrypt from "bcrypt";
import * as usersService from "../services/usersService.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const signUpController = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);
  const result = await usersService.signUp(name, email, hashedPassword);
  if (result.success) {
    const token = jwt.sign(
      {
        id: result.result.id,
        name: result.result.name,
        email: result.result.email,
      },
      process.env.JWT_SECRET,
    );
    return res.status(201).json({
      success: true,
      result: result.result,
      message: result.message,
      token: token,
    });
  } else {
    return res.status(400).json({ success: false, message: result.message });
  }
};

export const loginController = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Fill all the fields",
    });
  }
  const result = await usersService.login(email, password);
  if (result.success) {
    const token = jwt.sign(
      {
        id: result.result.id,
        name: result.result.name,
        email: result.result.email,
      },
      process.env.JWT_SECRET,
    );
    return res.status(200).json({
      success: true,
      result: result.result,
      message: result.message,
      token: token,
    });
  } else {
    return res.status(400).json({ success: false, message: result.message });
  }
};
