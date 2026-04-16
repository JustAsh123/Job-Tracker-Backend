import express from "express";
import {
  getJobsOfUser,
  createJob,
  updateJob,
  deleteJob,
  getJobById,
  getJobStats,
} from "../controllers/jobsController.js";
import { tokenValidator } from "../middlewares/tokenValidator.js";
const router = express();

router.get("/", tokenValidator, getJobsOfUser);
router.get("/stats", tokenValidator, getJobStats);
router.post("/", tokenValidator, createJob);
router.get("/:jobId", tokenValidator, getJobById);
router.put("/:jobId", tokenValidator, updateJob);
router.delete("/:jobId", tokenValidator, deleteJob);

export default router;
