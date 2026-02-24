import DetailsWrapper from "@/src/components/ui/DetailsWrapper";
import {
  ProjectAssets,
  ProjectDescription,
  UploadedFiles,
} from "@/src/components/ui/projects";
import { useProjects } from "@/src/context/ProjectsContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView } from "react-native";

export default function ProjectDetailsScreen() {
  const { projectId, name, status } = useLocalSearchParams();
  const { deleteProject, projects } = useProjects();
  const router = useRouter();

  const project = projects.find((p) => p.id === projectId);

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
        <ScrollView showsVerticalScrollIndicator={false}>
          <ProjectDescription
            description={project?.description}
            client_email={project?.client_email}
          />
          <ProjectAssets onUpload={() => {}} />
          <UploadedFiles
            files={project?.files ?? []}
            onFileMenu={(fileId) => console.log("menu:", fileId)}
          />
        </ScrollView>
      </DetailsWrapper.Content>
    </DetailsWrapper>
  );
}
