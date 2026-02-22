import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function QuoteScreen() {
  const { id } = useLocalSearchParams();

  return (
    <AuthScreenWrapper title="Project Details" subtitle={`Project: ${id}`}>
      {/* Add quote details or actions here */}
    </AuthScreenWrapper>
  );
}
