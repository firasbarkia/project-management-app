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
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1>Projects and Tasks Management</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* Search Projects */}
      <input
        type="text"
        placeholder="Search projects..."
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      {/* Projects Section */}
      <h2>Projects</h2>
      <form onSubmit={handleAddOrUpdateProject}>
        <input
          type="text"
          placeholder="Project Name"
          value={projectFormData.name}
          onChange={(e) =>
            setProjectFormData({ ...projectFormData, name: e.target.value })
          }
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <textarea
          placeholder="Project Description"
          value={projectFormData.description}
          onChange={(e) =>
            setProjectFormData({ ...projectFormData, description: e.target.value })
          }
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button type="submit">
          {editProjectId ? "Update Project" : "Add Project"}
        </button>
      </form>

      <ul>
        {filteredProjects.map((project) => (
          <li key={project.id}>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <button onClick={() => fetchTasks(project.id)}>View Tasks</button>
            <button onClick={() => setEditProjectId(project.id)}>Edit</button>
            <button onClick={() => handleDelete("project", project.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* Tasks Section */}
      {selectedProjectId && (
        <>
          <h2>Tasks</h2>
          <form onSubmit={handleAddOrUpdateTask}>
            <input
              type="text"
              placeholder="Task Title"
              value={taskFormData.title}
              onChange={(e) =>
                setTaskFormData({ ...taskFormData, title: e.target.value })
              }
              required
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            <textarea
              placeholder="Task Description"
              value={taskFormData.description}
              onChange={(e) =>
                setTaskFormData({ ...taskFormData, description: e.target.value })
              }
              required
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            />
            <button type="submit">
              {editTaskId ? "Update Task" : "Add Task"}
            </button>
          </form>

          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <button onClick={() => setEditTaskId(task.id)}>Edit</button>
                <button onClick={() => handleDelete("task", task.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ProjectsAndTasks;
