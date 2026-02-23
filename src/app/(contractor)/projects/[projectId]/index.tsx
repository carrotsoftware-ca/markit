import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function QuoteScreen() {
  const { projectId, name, status } = useLocalSearchParams();

  return (
    <AuthScreenWrapper title={`${name}`} subtitle={`${status}`}>
      {/* Add quote details or actions here */}
    </AuthScreenWrapper>
  );
}
