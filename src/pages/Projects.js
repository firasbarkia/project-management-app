import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editProjectId, setEditProjectId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login"); // Redirect to login if not logged in
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
        setFilteredProjects(data); // Set initial filtered list
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProjects();
  }, [navigate]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter projects based on the search query
    const filtered = projects.filter((project) =>
      project.name.toLowerCase().includes(query)
    );
    setFilteredProjects(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddOrUpdateProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      const method = editProjectId ? "put" : "POST";
      const url = editProjectId
        ? `http://localhost:3000/projects/update/${editProjectId}`
        : "http://localhost:3000/projects/create";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Operation failed.");
      }

      const updatedProject = await response.json();
      setSuccess(editProjectId ? "Project updated!" : "Project created!");
      setError("");

      if (editProjectId) {
        setProjects((prev) =>
          prev.map((proj) =>
            proj.id === editProjectId ? updatedProject : proj
          )
        );
      } else {
        setProjects((prev) => [...prev, updatedProject]);
      }

      setFormData({ name: "", description: "" });
      setEditProjectId(null);
      setSearchQuery(""); // Reset search query
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Delete failed.");
      }

      setProjects((prev) => prev.filter((proj) => proj.id !== id));
      setFilteredProjects((prev) => prev.filter((proj) => proj.id !== id)); // Remove from filtered list
      setSuccess("Project deleted!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (project) => {
    setEditProjectId(project.id);
    setFormData({ name: project.name, description: project.description });
  };

  return (
    <div style={styles.container}>
      <h1>Your Projects</h1>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={styles.searchInput}
        />
      </div>

      <form onSubmit={handleAddOrUpdateProject} style={styles.form}>
        <h2>{editProjectId ? "Edit Project" : "Add Project"}</h2>
        <div style={styles.inputGroup}>
          <label>Project Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>
          {editProjectId ? "Update Project" : "Add Project"}
        </button>
      </form>

      <ul style={styles.list}>
        {filteredProjects.map((project) => (
          <li key={project.id} style={styles.projectItem}>
            <h2>{project.name}</h2>
            <p>{project.description || "No description available."}</p>
            <button onClick={() => handleEdit(project)} style={styles.editButton}>
              Edit
            </button>
            <button
              onClick={() => handleDeleteProject(project.id)}
              style={styles.deleteButton}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  searchContainer: {
    marginBottom: "20px",
    textAlign: "center",
  },
  searchInput: {
    padding: "10px",
    fontSize: "16px",
    width: "100%",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  form: {
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    width: "100%",
  },
  button: {
    padding: "10px",
    marginTop: "10px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  list: {
    listStyleType: "none",
    padding: 0,
  },
  projectItem: {
    border: "1px solid #ddd",
    padding: "10px",
    marginBottom: "10px",
  },
  editButton: {
    marginRight: "10px",
    padding: "5px 10px",
    backgroundColor: "#FFC107",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "5px 10px",
    backgroundColor: "#DC3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: { color: "red" },
  success: { color: "green" },
};

export default Projects;
