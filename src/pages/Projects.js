import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProjectsAndTasks = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectFormData, setProjectFormData] = useState({ name: "", description: "" });
  const [taskFormData, setTaskFormData] = useState({ title: "", description: "" });
  const [editProjectId, setEditProjectId] = useState(null);
  const [editTaskId, setEditTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Fetch all projects for the logged-in user
  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/projects", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch projects.");
        }

        const data = await response.json();
        setProjects(data);
        setFilteredProjects(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProjects();
  }, [navigate]);

  // Fetch tasks for the selected project
  const fetchTasks = async (projectId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:3000/tasks/project/${projectId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch tasks.");
      }

      const data = await response.json();
      setTasks(data);
      setSelectedProjectId(projectId);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle search
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = projects.filter((project) =>
      project.name.toLowerCase().includes(query)
    );
    setFilteredProjects(filtered);
  };

  // Create or Update Project
  const handleAddOrUpdateProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const method = editProjectId ? "PUT" : "POST";
    const url = editProjectId
      ? `http://localhost:3000/projects/update/${editProjectId}`
      : "http://localhost:3000/projects/create";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save project.");
      }

      const updatedProject = await response.json();
      setSuccess(editProjectId ? "Project updated successfully!" : "Project created successfully!");
      setError("");

      // Refresh projects list
      const updatedProjects = editProjectId
        ? projects.map((project) =>
            project.id === editProjectId ? updatedProject : project
          )
        : [...projects, updatedProject];

      setProjects(updatedProjects);
      setFilteredProjects(updatedProjects);

      setProjectFormData({ name: "", description: "" });
      setEditProjectId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Create or Update Task
  const handleAddOrUpdateTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const method = editTaskId ? "PUT" : "POST";
    const url = editTaskId
      ? `http://localhost:3000/tasks/update/${editTaskId}`
      : `http://localhost:3000/tasks/create/${selectedProjectId}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save task.");
      }

      const updatedTask = await response.json();
      setSuccess(editTaskId ? "Task updated successfully!" : "Task created successfully!");
      setError("");

      // Refresh tasks list
      const updatedTasks = editTaskId
        ? tasks.map((task) => (task.id === editTaskId ? updatedTask : task))
        : [...tasks, updatedTask];

      setTasks(updatedTasks);

      setTaskFormData({ title: "", description: "" });
      setEditTaskId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete Project or Task
  const handleDelete = async (type, id) => {
    const token = localStorage.getItem("token");
    const url =
      type === "project"
        ? `http://localhost:3000/projects/delete/${id}`
        : `http://localhost:3000/tasks/delete/${id}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete ${type}.`);
      }

      setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);

      if (type === "project") {
        const updatedProjects = projects.filter((project) => project.id !== id);
        setProjects(updatedProjects);
        setFilteredProjects(updatedProjects);
        setTasks([]);
        setSelectedProjectId(null);
      } else {
        const updatedTasks = tasks.filter((task) => task.id !== id);
        setTasks(updatedTasks);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Projects and Tasks Management</h1>

      {/* Display Success/Error Messages */}
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search projects..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={styles.searchBar}
      />

      {/* Projects Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>Projects</h2>
        <button
          onClick={() => {
            setEditProjectId(null);
            setProjectFormData({ name: "", description: "" });
          }}
          style={styles.addButton}
        >
          + Add Project
        </button>

        <div style={styles.grid}>
          {filteredProjects.map((project) => (
            <div key={project.id} style={styles.card}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div style={styles.cardActions}>
                <button onClick={() => fetchTasks(project.id)} style={styles.viewButton}>
                  View Tasks
                </button>
                <button
                  onClick={() => {
                    setEditProjectId(project.id);
                    setProjectFormData({ name: project.name, description: project.description });
                  }}
                  style={styles.editButton}
                >
                  Edit
                </button>
                <button onClick={() => handleDelete("project", project.id)} style={styles.deleteButton}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Section */}
      {selectedProjectId && (
        <div style={styles.section}>
          <button onClick={() => setSelectedProjectId(null)} style={styles.backButton}>
            ← Back to Projects
          </button>
          <h2 style={styles.sectionHeader}>Tasks</h2>
          <button
            onClick={() => {
              setEditTaskId(null);
              setTaskFormData({ title: "", description: "" });
            }}
            style={styles.addButton}
          >
            + Add Task
          </button>

          <div style={styles.grid}>
            {tasks.map((task) => (
              <div key={task.id} style={styles.card}>
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <div style={styles.cardActions}>
                  <button
                    onClick={() => {
                      setEditTaskId(task.id);
                      setTaskFormData({ title: task.title, description: task.description });
                    }}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete("task", task.id)} style={styles.deleteButton}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    fontFamily: "'Arial', sans-serif",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  searchBar: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "20px",
  },
  section: {
    marginBottom: "30px",
  },
  sectionHeader: {
    marginBottom: "10px",
    color: "#555",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    padding: "15px",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  cardActions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  addButton: {
    padding: "10px 15px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "10px",
  },
  backButton: {
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  viewButton: {
    padding: "5px 10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  editButton: {
    padding: "5px 10px",
    backgroundColor: "#ffc107",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "5px 10px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  success: {
    padding: "10px",
    backgroundColor: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
    borderRadius: "5px",
    marginBottom: "20px",
  },
  error: {
    padding: "10px",
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
    borderRadius: "5px",
    marginBottom: "20px",
  },
};

export default ProjectsAndTasks;