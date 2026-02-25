import { useAuth } from "@/src/context/AuthContext";
import { CreateProjectInput, Project, ProjectFile } from "@/src/types";
import {
  createProject,
  deleteProject,
  updateProject,
  watchProject,
  watchProjectFiles,
  watchProjects,
} from "@services/projects";
import React, { createContext, useContext } from "react";

interface ProjectsContextType {
  loading: boolean;
  projects: Project[];
  project: Project | null;
  /** Files for the currently watched project, from the files subcollection */
  files: ProjectFile[];
  setLoading: (loading: boolean) => void;
  createProject: (data: Omit<CreateProjectInput, "ownerId">) => Promise<string>;
  updateProject: typeof updateProject;
  deleteProject: typeof deleteProject;
  watchProjects: () => () => void;
  watchProject: (projectId: string) => () => void;
  watchProjectFiles: (projectId: string) => () => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(
  undefined,
);

export const ProjectsProvider = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [project, setProject] = React.useState<Project | null>(null);
  const [files, setFiles] = React.useState<ProjectFile[]>([]);

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
  const handleWatchProject = (projectId: string) => {
    return watchProject(projectId, setProject);
  };
  const handleWatchProjectFiles = (projectId: string) => {
    return watchProjectFiles(projectId, setFiles);
  };

  return (
    <ProjectsContext.Provider
      value={{
        loading,
        projects,
        project,
        files,
        setProjects,
        setLoading,
        createProject: handleCreateProject,
        updateProject,
        deleteProject,
        watchProjects: handleWatchedProjects,
        watchProject: handleWatchProject,
        watchProjectFiles: handleWatchProjectFiles,
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
