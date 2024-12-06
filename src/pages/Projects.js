import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/projects.css";

const ProjectsAndTasks = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectFormData, setProjectFormData] = useState({ name: "", description: "" });
  const [taskFormData, setTaskFormData] = useState({ title: "", description: "", completed: false });
  const [editProjectId, setEditProjectId] = useState(null);
  const [editTaskId, setEditTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "project" or "task"

  const navigate = useNavigate();

  // Fetch projects on mount
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

  // Fetch tasks for a project
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

  // Handle search input
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = projects.filter((project) =>
      project.name.toLowerCase().includes(query)
    );
    setFilteredProjects(filtered);
  };

  // Open Modal
  const openModal = (type, data = {}) => {
    setModalType(type);

    if (type === "project") {
      setProjectFormData(data || { name: "", description: "" });
      setEditProjectId(data?.id || null);
    } else if (type === "task") {
      setTaskFormData(data || { title: "", description: "", completed: false });
      setEditTaskId(data?.id || null);
    }

    setShowModal(true);
  };

  // Close Modal
  const closeModal = () => {
    setShowModal(false);
    setProjectFormData({ name: "", description: "" });
    setTaskFormData({ title: "", description: "", completed: false });
  };

  // Create or Update Project/Task
  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Determine whether it's a "create" or "update" operation
    const isUpdate = modalType === "project" ? !!editProjectId : !!editTaskId;
    const method = isUpdate ? "PUT" : "POST";

    // Construct the appropriate URL based on type and whether it's an update
    const url =
      modalType === "project"
        ? isUpdate
          ? `http://localhost:3000/projects/update/${editProjectId}`
          : "http://localhost:3000/projects/create"
        : isUpdate
        ? `http://localhost:3000/tasks/update/${editTaskId}`
        : `http://localhost:3000/tasks/create/${selectedProjectId}`;

    // Use the appropriate form data (project or task)
    const formData = modalType === "project" ? projectFormData : { ...taskFormData, completed: taskFormData.completed };

    try {
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
        throw new Error(errorData.message || `Failed to save ${modalType}.`);
      }

      const updatedItem = await response.json();

      setSuccess(
        isUpdate
          ? `${modalType.charAt(0).toUpperCase() + modalType.slice(1)} updated!`
          : `${modalType.charAt(0).toUpperCase() + modalType.slice(1)} created!`
      );

      // Refresh data based on the type (project or task)
      if (modalType === "project") {
        const updatedProjects = isUpdate
          ? projects.map((project) =>
              project.id === editProjectId ? updatedItem : project
            )
          : [...projects, updatedItem];

        setProjects(updatedProjects);
        setFilteredProjects(updatedProjects);
      } else {
        const updatedTasks = isUpdate
          ? tasks.map((task) => (task.id === editTaskId ? updatedItem : task))
          : [...tasks, updatedItem];

        setTasks(updatedTasks);
      }

      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  // Function to handle deletion of projects or tasks
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
        if (selectedProjectId === id) {
          setSelectedProjectId(null);
          setTasks([]);
        }
      } else if (type === "task") {
        const updatedTasks = tasks.filter((task) => task.id !== id);
        setTasks(updatedTasks);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle task completion status
  const handleToggleTaskCompletion = async (taskId, completed) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:3000/tasks/update/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !completed }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update task status.");
      }

      const updatedTask = await response.json();
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, completed: updatedTask.completed } : task
      );

      setTasks(updatedTasks);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h1>Projects and Tasks</h1>

      {/* Error/Success Messages */}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Search */}
      <input
        type="text"
        placeholder="Search Projects"
        value={searchQuery}
        onChange={handleSearchChange}
        className="search"
      />

      {/* Projects Section */}
      <div className="section">
        <h2>Projects</h2>
        <button onClick={() => openModal("project")} className="btn btn-add">
          + Add Project
        </button>
        <div className="grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="card">
              <h4>{project.name}</h4>
              <p>{project.description}</p>
              <button onClick={() => fetchTasks(project.id)} className="btn btn-primary">
                View Tasks
              </button>
              <button onClick={() => openModal("project", project)} className="btn btn-secondary">
                Edit
              </button>
              <button onClick={() => handleDelete("project", project.id)} className="btn btn-danger">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Section */}
      {selectedProjectId && (
        <div className="section">
          <h2>Tasks for Project</h2>
          <button onClick={() => openModal("task")} className="btn btn-add">
            + Add Task
          </button>
          <div className="grid">
            {tasks.map((task) => (
              <div key={task.id} className="card">
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <p>Status: {task.completed ? "Completed" : "Pending"}</p>
                <button onClick={() => openModal("task", task)} className="btn btn-secondary">
                  Edit
                </button>
                <button onClick={() => handleDelete("task", task.id)} className="btn btn-danger">
                  Delete
                </button>
                {/* Checkbox outside the modal */}
                <div>
                  <label>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTaskCompletion(task.id, task.completed)}
                    />
                    Mark as {task.completed ? "Pending" : "Completed"}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <form onSubmit={handleSave}>
              <input
                type="text"
                placeholder={modalType === "project" ? "Name" : "Title"}
                value={modalType === "project" ? projectFormData.name : taskFormData.title}
                onChange={(e) =>
                  modalType === "project"
                    ? setProjectFormData({ ...projectFormData, name: e.target.value })
                    : setTaskFormData({ ...taskFormData, title: e.target.value })
                }
                required
              />
              <textarea
                placeholder="Description"
                value={modalType === "project" ? projectFormData.description : taskFormData.description}
                onChange={(e) =>
                  modalType === "project"
                    ? setProjectFormData({ ...projectFormData, description: e.target.value })
                    : setTaskFormData({ ...taskFormData, description: e.target.value })
                }
                required
              />
              <button type="submit" className="btn btn-primary">
                Save
              </button>
              <button type="button" onClick={closeModal} className="btn btn-secondary">
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsAndTasks;
