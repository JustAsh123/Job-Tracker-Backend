import * as jobsService from "../services/jobsService.js";

export const getJobsOfUser = async (req, res) => {
  const result = await jobsService.jobsOfUser(req.user.id);
  if (result.success) {
    return res.status(200).json({
      success: true,
      result: result.result,
      message: result.message,
      user: req.user,
    });
  } else {
    return res.status(400).json({ success: false, message: result.message });
  }
};

export const getJobById = async (req, res) => {
  const { jobId } = req.params;
  const result = await jobsService.getJobById(jobId, req.user.id);
  if (result.success) {
    return res.status(200).json({
      success: true,
      result: result.result,
      message: result.message,
      user: req.user,
    });
  } else {
    return res.status(400).json({ success: false, message: result.message });
  }
};

export const createJob = async (req, res) => {
  const { company, role, applied_at, notes } = req.body;
  const result = await jobsService.createJob(
    req.user.id,
    company,
    role,
    applied_at,
    notes,
  );
  if (result.success) {
    return res.status(200).json({
      success: true,
      result: result.result,
      message: result.message,
      user: req.user,
    });
  } else {
    return res.status(400).json({ success: false, message: result.message });
  }
};

export const updateJob = async (req, res) => {
  const { jobId } = req.params;
  const { status, notes } = req.body;
  const result = await jobsService.updateJob(jobId, req.user.id, status, notes);
  if (result.success) {
    return res.status(200).json({
      success: true,
      result: result.result,
      message: result.message,
      user: req.user,
    });
  } else {
    return res.status(400).json({ success: false, message: result.message });
  }
};

export const deleteJob = async (req, res) => {
  const { jobId } = req.params;
  const result = await jobsService.deleteJob(jobId, req.user.id);
  if (result.success) {
    return res.status(200).json({
      success: true,
      result: result.result,
      message: result.message,
      user: req.user,
    });
  } else {
    return res.status(400).json({ success: false, message: result.message });
  }
};
