import {
  createProject,
  deleteProject,
  updateProject,
  watchProjects,
} from "@services/projects";
import React, { createContext, useContext } from "react";

const ProjectsContext = createContext();

export const ProjectsProvider = ({ children }) => {
  const [loading, setLoading] = React.useState(false);
  const [projects, setProjects] = React.useState([]);

  return (
    <ProjectsContext.Provider
      value={{
        loading,
        projects,
        setLoading,
        createProject,
        updateProject,
        deleteProject,
        watchProjects,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjects must be used within a projects provider");
  }

  return context;
};
