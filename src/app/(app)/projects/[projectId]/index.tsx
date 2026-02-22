import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function QuoteScreen() {
  const { projectId } = useLocalSearchParams();

  return (
    <AuthScreenWrapper title="Project Details" subtitle={`Project: ${projectId}`}>
      {/* Add quote details or actions here */}
    </AuthScreenWrapper>
  );
}
