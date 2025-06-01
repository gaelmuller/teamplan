import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import './App.css';
import TeamManagement from './components/TeamManagement/TeamManagement';
import ProjectManagement from './components/ProjectManagement/ProjectManagement';
import TimelineDisplay from './components/Timeline/Timeline';
import initialData from './data/initialData.json';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

function App() {
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);

  // Initialize data (similar to before, but wrapped for clarity)
  const initializeData = useCallback(() => {
    let currentGroups = initialData.groups || [];
    let currentProjects = initialData.projects || [];
    let currentItems = initialData.items || [];

    if (currentGroups.length === 0) {
      currentGroups = [{ id: 'g1', title: 'Team Member 1' }, { id: 'g2', title: 'Team Member 2' }];
    }
    if (currentProjects.length === 0) {
      currentProjects = [{ id: 'p1', name: 'Project Alpha' }, { id: 'p2', name: 'Project Beta' }];
    }

    if (currentItems.length === 0 && currentGroups.length > 0 && currentProjects.length > 0) {
      currentItems = [
        { id: uuidv4(), group: currentGroups[0].id, project: currentProjects[0].id, title: `${currentProjects[0].name} (Task 1)`, start_time: moment().add(-1, 'days').valueOf(), end_time: moment().add(1, 'days').valueOf(), canMove: true, canResize: 'right' },
        { id: uuidv4(), group: currentGroups[0].id, project: currentProjects[1].id, title: `${currentProjects[1].name} (Task 2)`, start_time: moment().add(2, 'days').valueOf(), end_time: moment().add(3, 'days').valueOf(), canMove: true, canResize: 'right' },
      ];
    } else {
      // Ensure items have project IDs and valid times if loaded from initialData.json
      currentItems = currentItems.map(i => ({
        ...i,
        project: i.project || (currentProjects.length > 0 ? currentProjects[0].id : null),
        start_time: moment(i.start_time).valueOf(), // Ensure time is a valueOf timestamp
        end_time: moment(i.end_time).valueOf()
      }));
    }
    setGroups(currentGroups);
    setProjects(currentProjects);
    setItems(currentItems);
  }, []); // No dependencies, this is for initial mount or manual trigger

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const addGroup = (title) => {
    const newGroup = { id: uuidv4(), title };
    setGroups(g => [...g, newGroup]);
  };

  const deleteGroup = (id) => {
    setGroups(g => g.filter(group => group.id !== id));
    setItems(i => i.filter(item => item.group !== id));
  };

  const addProject = (name) => {
    const newProject = { id: uuidv4(), name };
    setProjects(p => [...p, newProject]);
  };

  const deleteProject = (id) => {
    setProjects(p => p.filter(project => project.id !== id));
    setItems(i => i.filter(item => item.project !== id));
  };

  const addAssignment = (assignment) => {
    const newAssignment = {
        ...assignment,
        id: uuidv4(),
        start_time: moment(assignment.start_time).valueOf(), // Ensure timestamps
        end_time: moment(assignment.end_time).valueOf(),
        canMove: true,
        canResize: 'right'
    };
    setItems(i => [...i, newAssignment]);
  };

  const handleExport = () => {
    const dataToExport = {
      groups,
      projects,
      items,
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-planning-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (importedData.groups && importedData.projects && importedData.items) {
            // Basic validation and data transformation could be added here
            setGroups(importedData.groups.map(g => ({...g, id: g.id || uuidv4()}))); // Ensure IDs
            setProjects(importedData.projects.map(p => ({...p, id: p.id || uuidv4()}))); // Ensure IDs
            setItems(importedData.items.map(i => ({
              ...i,
              id: i.id || uuidv4(), // Ensure IDs
              start_time: moment(i.start_time).valueOf(), // Ensure times are moment-compatible
              end_time: moment(i.end_time).valueOf(),
              // Add other necessary fields if they might be missing from an old export
              canMove: i.canMove !== undefined ? i.canMove : true,
              canResize: i.canResize !== undefined ? i.canResize : 'right',
              project: i.project || (projects.length > 0 ? projects[0].id : null) // Ensure project link
            })));
          } else {
            alert('Invalid JSON structure.');
          }
        } catch (error) {
          alert('Error parsing JSON file: ' + error.message);
        }
      };
      reader.readAsText(file);
      // Reset file input value to allow importing the same file again if needed
      event.target.value = null;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Team Planning Calendar</h1>
        <div className="import-export-buttons">
          <input type="file" id="import-file" onChange={handleImport} style={{ display: 'none' }} accept=".json" />
          <label htmlFor="import-file" className="button-like">Import JSON</label>
          <button onClick={handleExport}>Export JSON</button>
        </div>
      </header>
      <main>
        <div className="management-sections">
          <TeamManagement groups={groups} addGroup={addGroup} deleteGroup={deleteGroup} />
          <ProjectManagement projects={projects} addProject={addProject} deleteProject={deleteProject} />
        </div>
        <div className="add-assignment-form">
          <h3>Add New Assignment</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const groupEl = e.target.elements.group;
            const projectEl = e.target.elements.project;
            const startDateEl = e.target.elements.startDate;
            const endDateEl = e.target.elements.endDate;
            if (groupEl.value && projectEl.value && startDateEl.value && endDateEl.value) {
              addAssignment({
                group: groupEl.value,
                project: projectEl.value,
                title: `${projects.find(p=>p.id === projectEl.value)?.name}`, // Optional: title can be auto-generated
                start_time: startDateEl.value,
                end_time: endDateEl.value,
              });
               // e.target.reset(); // Optionally reset form
            } else {
              alert("Please fill all fields for the assignment.");
            }
          }}>
            <select name="group" defaultValue="">
              <option value="" disabled>Select Team Member</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
            <select name="project" defaultValue="">
              <option value="" disabled>Select Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="date" name="startDate" required />
            <input type="date" name="endDate" required />
            <button type="submit">Add Assignment</button>
          </form>
        </div>
        <TimelineDisplay
            groups={groups}
            items={items}
            setItems={setItems}
            projects={projects}
        />
      </main>
    </div>
  );
}

export default App;
