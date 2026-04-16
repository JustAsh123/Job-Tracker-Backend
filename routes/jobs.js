import express from "express";
import {
  getJobsOfUser,
  createJob,
  updateJob,
  deleteJob,
  getJobById,
} from "../controllers/jobsController.js";
import { tokenValidator } from "../middlewares/tokenValidator.js";
import { getUsersByID } from "../services/usersService.js";
const router = express();

router.get("/", tokenValidator, getJobsOfUser);
router.get("/:jobId", tokenValidator, getJobById);
router.post("/", tokenValidator, createJob);
router.put("/:jobId", tokenValidator, updateJob);
router.delete("/:jobId", tokenValidator, deleteJob);

export default router;
