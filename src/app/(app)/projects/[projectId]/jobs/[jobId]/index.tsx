import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function Jobs() {
  const { projectId, jobId } = useLocalSearchParams();

  return (
    <AuthScreenWrapper title="Job" subtitle={`Job ${jobId}`}>
      {/* Add quote details or actions here */}
    </AuthScreenWrapper>
  );
}
