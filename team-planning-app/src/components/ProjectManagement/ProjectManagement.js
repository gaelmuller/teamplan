import React, { useState } from 'react';
import './ProjectManagement.css'; // We'll use App.css for now, but good to have its own file

function ProjectManagement({ projects, addProject, deleteProject }) {
  const [newProjectName, setNewProjectName] = useState('');

  const handleAddProject = () => {
    if (newProjectName.trim() === '') return;
    addProject(newProjectName.trim());
    setNewProjectName('');
  };

  return (
    <div className="project-management">
      <h2>Projects</h2>
      <div className="add-project">
        <input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="New project name"
        />
        <button onClick={handleAddProject}>Add Project</button>
      </div>
      <ul>
        {projects.map(project => (
          <li key={project.id}>
            {project.name}
            <button onClick={() => deleteProject(project.id)} className="delete-btn">Delete</button>
          </li>
        ))}
        {projects.length === 0 && <p>No projects yet. Add one!</p>}
      </ul>
    </div>
  );
}

export default ProjectManagement;
