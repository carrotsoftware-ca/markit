import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import FormWrapper from "@/src/components/ui/FormWrapper";
import React from "react";
import { StyleSheet } from "react-native";

export default function AddProject() {
  const handleSubmit = (data) => {
    // TODO: handle project creation logic
    console.log("New project submitted:", data);
  };

  return (
    <AuthScreenWrapper title="New Project" subtitle="Create a new project">
      <FormWrapper>
        
      </FormWrapper>
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
