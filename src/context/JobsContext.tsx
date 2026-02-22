import React, { createContext, useContext } from "react";

const JobsContext = createContext();

export const JobsProvider = ({ children }) => {
  const [loading, setLoading] = React.useState(false)
  const [jobs, setJobs] = React.useState([]);

  return (
    <JobsContext.Provider
      value={{
        loading,
        jobs,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error("useJobs must be used within a JobsProvider");
  }

  return context;
};
