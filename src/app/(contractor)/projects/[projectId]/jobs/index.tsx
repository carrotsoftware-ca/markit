import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function QuoteScreen() {
  const { projectId } = useLocalSearchParams();

  return (
    <AuthScreenWrapper title="Jobs " subtitle={`Jobs for Project: ${projectId}`}>
      {/* Add quote details or actions here */}
    </AuthScreenWrapper>
  );
}
