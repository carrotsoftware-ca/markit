import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function Jobs() {
  const { id } = useLocalSearchParams();

  return (
    <AuthScreenWrapper title="Job" subtitle={`Job for project ${id}`}>
      {/* Add quote details or actions here */}
    </AuthScreenWrapper>
  );
}
