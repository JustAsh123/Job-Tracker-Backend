import express from "express";
import userRouter from "./routes/users.js";
import jobRouter from "./routes/jobs.js";
const app = express();

app.use(express.json());

app.use("/users", userRouter);
app.use("/jobs", jobRouter);

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
