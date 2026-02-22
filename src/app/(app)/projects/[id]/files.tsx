import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import { useLocalSearchParams } from "expo-router";
import React from "react";

export default function QuoteScreen() {
  const { id } = useLocalSearchParams();

  return (
    <AuthScreenWrapper title="Files" subtitle={`Files for Job : ${id}`}>
      {/* Add quote details or actions here */}
    </AuthScreenWrapper>
  );
}
