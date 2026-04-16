import { pool } from "../db.js";

export const jobsOfUser = async (userId, queries) => {
  let query = "SELECT * FROM jobs WHERE user_id = $1";
  let values = [userId];
  if (queries.status) {
    query += ` AND status = $${values.length + 1}::status_type`;
    values.push(queries.status);
  }
  if (queries.company) {
    query += ` AND company = $${values.length + 1}::text`;
    values.push(queries.company);
  }
  console.log(query);
  const result = await pool.query(query, values);

  return {
    success: true,
    result: result.rows,
    message: "Jobs fetched successfully",
  };
};

export const getJobById = async (jobId, userId) => {
  const result = await pool.query(
    "SELECT * FROM jobs WHERE id = $1 AND user_id = $2",
    [jobId, userId],
  );
  if (result.rowCount === 0) {
    return {
      success: false,
      message: "Job not found",
    };
  }
  return {
    success: true,
    result: result.rows[0],
    message: "Job fetched successfully",
  };
};

// user_id , company, role, applied_at, notes, status

export const createJob = async (userId, company, role, applied_at, notes) => {
  const result = await pool.query(
    "INSERT INTO jobs (user_id, company, role, status, applied_at, notes) VALUES ($1, $2, $3, $4, $5, $6)",
    [userId, company, role, "applied", applied_at, notes],
  );
  return {
    success: true,
    result: result.rows[0],
    message: "Job created successfully",
  };
};

export const updateJob = async (jobId, userId, status, notes) => {
  let SET_query = "";
  let VALUES_query = [jobId, userId];
  if (status && notes) {
    SET_query += "status = $3 notes = $4";
    VALUES_query.push(status, notes);
  } else if (status) {
    SET_query += "status = $3";
    VALUES_query.push(status);
  } else if (notes) {
    SET_query += "notes = $3";
    VALUES_query.push(notes);
  }
  const query = `UPDATE jobs SET ${SET_query} WHERE id = $1 AND user_id = $2`;
  const result = await pool.query(query, VALUES_query);
  return {
    success: true,
    result: result.rows[0],
    message: "Job updated successfully",
  };
};

export const deleteJob = async (jobId, userId) => {
  const result = await pool.query(
    "DELETE FROM jobs WHERE id = $1 AND user_id = $2",
    [jobId, userId],
  );
  if (result.rowCount === 0) {
    return {
      success: false,
      message: "Job not found",
    };
  }
  return {
    success: true,
    result: result.rows[0],
    message: "Job deleted successfully",
  };
};

export const getJobStats = async (userId) => {
  const result = await pool.query(
    "SELECT status, COUNT(status) as count FROM jobs WHERE user_id = $1 GROUP BY status ORDER BY status",
    [userId],
  );
  return {
    success: true,
    result: result.rows,
    message: "Job stats fetched successfully",
  };
};
