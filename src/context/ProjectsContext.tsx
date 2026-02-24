import { useAuth } from "@/src/context/AuthContext";
import { CreateProjectInput } from "@/src/types";
import {
  createProject,
  deleteProject,
  updateProject,
  watchProjects,
} from "@services/projects";
import React, { createContext, useContext } from "react";

interface ProjectsContextType {
  loading: boolean;
  projects: any[];
  setLoading: (loading: boolean) => void;
  createProject: (data: Omit<CreateProjectInput, "ownerId">) => Promise<string>;
  updateProject: typeof updateProject;
  deleteProject: typeof deleteProject;
  watchProjects: () => () => void; // wrapped version, no args needed
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(
  undefined,
);

export const ProjectsProvider = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [projects, setProjects] = React.useState([]);

  const handleCreateProject = async (
    data: Omit<CreateProjectInput, "ownerId">,
  ): Promise<string> => {
    if (!user?.id) throw new Error("User not authenticated");
    const projectId = await createProject({ ...data, ownerId: user.id });
    return projectId;
  };
  const handleWatchedProjects = () => {
    if (!user?.id) throw new Error("User not authenticated");
    return watchProjects(setProjects, user.id);
  };

  // Note: createdAt and updatedAt are set by the service layer using server timestamps

  return (
    <ProjectsContext.Provider
      value={{
        loading,
        projects,
        setProjects,
        setLoading,
        createProject: handleCreateProject,
        updateProject,
        deleteProject,
        watchProjects: handleWatchedProjects,
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
