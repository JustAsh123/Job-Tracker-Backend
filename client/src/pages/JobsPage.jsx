import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getJobs, getJobStats, createJob, updateJob, deleteJob } from "../api";

const STATUS_COLORS = {
  applied: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  interview: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  offer: "bg-green-500/15 text-green-400 border-green-500/25",
  rejected: "bg-red-500/15 text-red-400 border-red-500/25",
};

const STATUS_OPTIONS = ["applied", "interview", "offer", "rejected"];

const STAT_META = {
  applied: { label: "Applied", color: "border-blue-500/40 text-blue-400" },
  interview: {
    label: "Interview",
    color: "border-yellow-500/40 text-yellow-400",
  },
  offer: { label: "Offer", color: "border-green-500/40 text-green-400" },
  rejected: { label: "Rejected", color: "border-red-500/40 text-red-400" },
};

// ─── Add Job Modal ────────────────────────────────────────────────────────────

function AddJobModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    company: "",
    role: "",
    applied_at: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.company || !form.role) {
      setError("Company and Role are required.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        company: form.company,
        role: form.role,
        notes: form.notes || null,
        applied_at: form.applied_at || null,
      };
      const res = await createJob(payload);
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Add new job</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-lg leading-none"
          >
            &times;
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Company *
              </label>
              <input
                id="new-company"
                name="company"
                className="input"
                placeholder="Google"
                value={form.company}
                onChange={handle}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Role *</label>
              <input
                id="new-role"
                name="role"
                className="input"
                placeholder="SWE Intern"
                value={form.role}
                onChange={handle}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Applied date
            </label>
            <input
              id="new-applied-at"
              name="applied_at"
              type="date"
              className="input"
              value={form.applied_at}
              onChange={handle}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes</label>
            <textarea
              id="new-notes"
              name="notes"
              className="input resize-none"
              rows={3}
              placeholder="Recruiter name, referral, etc."
              value={form.notes}
              onChange={handle}
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              id="add-job-submit"
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? "Adding…" : "Add job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Job Modal ───────────────────────────────────────────────────────────

function EditJobModal({ job, onClose, onUpdated }) {
  const [status, setStatus] = useState(job.status || "applied");
  const [notes, setNotes] = useState(job.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user")); // 🔥 get user

      const res = await updateJob(job.id, user.id, status, notes);

      onUpdated({ ...job, status, notes });
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">
            Edit — {job.company}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-lg leading-none"
          >
            &times;
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Status</label>
            <select
              id="edit-status"
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes</label>
            <textarea
              id="edit-notes"
              className="input resize-none"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes…"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              id="edit-job-submit"
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Jobs Page ────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const { user, authLogout } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});
  const [jobsLoading, setJobsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterInput, setFilterInput] = useState("");

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [editJob, setEditJob] = useState(null);

  const handleUnauthorized = useCallback(
    (err) => {
      if (err.response?.status === 401 || err.response?.status === 403) {
        authLogout();
        navigate("/login");
      }
    },
    [authLogout, navigate],
  );

  // Fetch jobs
  const fetchJobs = useCallback(
    async (statusVal, companyVal) => {
      setJobsLoading(true);
      setError("");
      try {
        const params = {};
        if (statusVal) params.status = statusVal;
        if (companyVal) params.company = companyVal;
        const res = await getJobs(params);
        setJobs(res.data.result || []);
      } catch (err) {
        handleUnauthorized(err);
        setError(err.response?.data?.message || "Failed to load jobs.");
      } finally {
        setJobsLoading(false);
      }
    },
    [handleUnauthorized],
  );

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getJobStats();
      const statsMap = {};
      (res.data.result || []).forEach(({ status, count }) => {
        statsMap[status] = parseInt(count, 10);
      });
      setStats(statsMap);
    } catch (err) {
      handleUnauthorized(err);
      console.error("Stats fetch error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    fetchJobs(filterStatus, filterCompany);
    fetchStats();
  }, []);

  // Apply filters
  const applyFilters = () => {
    fetchJobs(filterStatus, filterInput.trim());
  };

  // Reset filters
  const resetFilters = () => {
    setFilterStatus("");
    setFilterCompany("");
    setFilterInput("");
    fetchJobs("", "");
  };

  // After job created — refetch both
  const handleJobCreated = () => {
    fetchJobs(filterStatus, filterCompany);
    fetchStats();
  };

  // After job updated — update in place + refetch stats
  const handleJobUpdated = (updatedJob) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)),
    );
    fetchStats();
  };

  // Delete job
  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      fetchStats();
    } catch (err) {
      handleUnauthorized(err);
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  const logout = () => {
    authLogout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0f0f11]">
      {/* Navbar */}
      <header className="border-b border-[#1e1e24] bg-[#0f0f11] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-white tracking-tight">
            JobTracker
          </span>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 hidden sm:block">
              {user?.name || user?.email}
            </span>
            <button
              id="logout-btn"
              onClick={logout}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(STAT_META).map(([key, meta]) => (
            <div key={key} className={`card p-4 border-t-2 ${meta.color}`}>
              <p className="text-xs text-gray-500 mb-1">{meta.label}</p>
              <p
                className={`text-2xl font-semibold ${meta.color.split(" ").slice(-1)}`}
              >
                {statsLoading ? "—" : (stats[key] ?? 0)}
              </p>
            </div>
          ))}
        </div>

        {/* Filters + Add */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            id="filter-status"
            className="input sm:w-40"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <input
            id="filter-company"
            className="input flex-1"
            placeholder="Filter by company…"
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
          <button
            id="apply-filter"
            onClick={applyFilters}
            className="btn-secondary whitespace-nowrap"
          >
            Apply
          </button>
          {(filterStatus || filterInput) && (
            <button
              id="reset-filter"
              onClick={resetFilters}
              className="btn-secondary whitespace-nowrap text-gray-400"
            >
              Reset
            </button>
          )}
          <button
            id="add-job-btn"
            onClick={() => setShowAdd(true)}
            className="btn-primary whitespace-nowrap"
          >
            + Add job
          </button>
        </div>

        {/* Jobs List */}
        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded px-4 py-3">
            {error}
          </p>
        )}

        {jobsLoading ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            Loading jobs…
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            No jobs found.{" "}
            <button
              onClick={() => setShowAdd(true)}
              className="text-indigo-400 hover:text-indigo-300"
            >
              Add your first one
            </button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[1fr_1fr_120px_140px_80px] gap-4 px-4 py-2.5 border-b border-[#222229] text-xs text-gray-500 font-medium uppercase tracking-wide">
              <span>Company</span>
              <span>Role</span>
              <span>Applied</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#1d1d24]">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_140px_80px] gap-2 sm:gap-4 px-4 py-3.5 items-center hover:bg-[#1a1a21] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {job.company}
                    </p>
                    {job.notes && (
                      <p className="text-xs text-gray-500 truncate max-w-xs mt-0.5">
                        {job.notes}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-300">{job.role}</p>
                  <p className="text-xs text-gray-500">
                    {job.applied_at
                      ? new Date(job.applied_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                  <div>
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded border capitalize ${STATUS_COLORS[job.status] || "bg-gray-500/15 text-gray-400 border-gray-500/25"}`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="flex gap-1.5 sm:justify-end">
                    <button
                      id={`edit-${job.id}`}
                      onClick={() => setEditJob(job)}
                      className="btn-secondary text-xs px-2.5 py-1"
                    >
                      Edit
                    </button>
                    <button
                      id={`delete-${job.id}`}
                      onClick={() => handleDelete(job.id)}
                      className="btn-danger"
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-[#222229] text-xs text-gray-500">
              {jobs.length} job{jobs.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </main>

      {showAdd && (
        <AddJobModal
          onClose={() => setShowAdd(false)}
          onCreated={handleJobCreated}
        />
      )}
      {editJob && (
        <EditJobModal
          job={editJob}
          onClose={() => setEditJob(null)}
          onUpdated={handleJobUpdated}
        />
      )}
    </div>
  );
}
