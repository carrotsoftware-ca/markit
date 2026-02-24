import DetailsWrapper from "@/src/components/ui/DetailsWrapper";
import { useProjects } from "@/src/context/ProjectsContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

export default function ProjectDetailsScreen() {
  const { projectId, name, status } = useLocalSearchParams();
  const { deleteProject } = useProjects();
  const router = useRouter();

  return (
    <DetailsWrapper>
      <DetailsWrapper.NavAction>
        <Pressable onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} />
        </Pressable>
      </DetailsWrapper.NavAction>
      <DetailsWrapper.Title>{name}</DetailsWrapper.Title>
      <DetailsWrapper.Subtitle>{status}</DetailsWrapper.Subtitle>
      <DetailsWrapper.HeaderAction>
        <Pressable
          onPress={async () => {
            try {
              await deleteProject(projectId);
              router.replace("/(contractor)/projects");
            } catch (error) {
              console.log(error);
            }
            // Show confirmation, then:
          }}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={24}
            color="red"
          />
        </Pressable>
      </DetailsWrapper.HeaderAction>
      <DetailsWrapper.Content>
        {/* Main content goes here */}
      </DetailsWrapper.Content>
    </DetailsWrapper>
  );
}
