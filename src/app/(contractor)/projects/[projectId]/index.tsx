import DetailsWrapper from "@/src/components/ui/DetailsWrapper";
import { useProjects } from "@/src/context/ProjectsContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

export default function QuoteScreen() {
  const { projectId, name, status } = useLocalSearchParams();
  const { deleteProject } = useProjects();
  const router = useRouter();
  return (
    <DetailsWrapper
      onBack={() => router.back()}
      onDelete={async () => {
        try {
          await deleteProject(projectId);
          router.replace("/(contractor)/projects");
        } catch (error) {
          console.log(error);
        }
        // Show confirmation, then:
      }}
      title={`${name}`}
      subtitle={`${status}`}
    >
      {/* Add quote details or actions here */}
    </DetailsWrapper>
  );
}
