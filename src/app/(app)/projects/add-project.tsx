import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import React from "react";
import { StyleSheet } from "react-native";
import NewProjectForm from "@/src/components/forms/NewProjectForm";

export default function AddProject() {
  const handleSubmit = (data) => {
    // TODO: handle project creation logic
    console.log("New project submitted:", data);
  };

  return (
    <AuthScreenWrapper
      title="New Project"
      subtitle="Create a new project"
    >
      <NewProjectForm onSubmit={handleSubmit} />
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
