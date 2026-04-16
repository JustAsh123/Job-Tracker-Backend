import { pool } from "../db.js";
import bcrypt from "bcrypt";

export const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users");
  return { success: true, result: result.rows };
};

export const getUsersByID = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return { success: true, result: result.rows[0] };
};

const exists = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows.length > 0;
};

export const signUp = async (name, email, password) => {
  const userExists = await exists(email);
  if (userExists) {
    return { success: false, message: "User already exists" };
  }
  const result = await pool.query(
    "insert into users (name,email,password) values ($1,$2,$3) returning *",
    [name, email, password],
  );
  return {
    success: true,
    result: result.rows[0],
    message: "User created successfully.",
  };
};

export const login = async (email, password) => {
  const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (user.rows.length === 0) {
    return { success: false, message: "User with that email doesnt exist" };
  }
  const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
  if (!isPasswordValid) {
    return { success: false, message: "Invalid password" };
  }
  return {
    success: true,
    result: {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
    },
    message: "User logged in successfully.",
  };
};
