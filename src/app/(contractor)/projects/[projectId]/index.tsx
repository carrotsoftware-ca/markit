import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import DetailsWrapper from "@/src/components/ui/DetailsWrapper";
import {
  ProjectAssets,
  ProjectDescription,
  UploadedFiles,
} from "@/src/components/ui/projects";
import { useProjects } from "@/src/context/ProjectsContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useConfirmDialog } from "@/src/hooks/useConfirmDialog";
import { pickMedia } from "@/src/hooks/useMediaPicker";
import { deleteProjectFile, uploadProjectFile } from "@/src/services/projects";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, ScrollView } from "react-native";

export default function ProjectDetailsScreen() {
  const { projectId, name, status } = useLocalSearchParams();
  const { deleteProject, watchProject, project } = useProjects();
  const { theme } = useTheme();
  const router = useRouter();
  const dialog = useConfirmDialog();

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = watchProject(projectId as string);
      return () => unsubscribe();
    }, [projectId]),
  );

  const handleUpload = async () => {
    const media = await pickMedia();
    if (!media) return;
    await uploadProjectFile(
      projectId as string,
      media.uri,
      media.filename,
      media.mimeType,
      media.fileSize,
    );
  };

  const handleFileMenu = (fileId: string) => {
    const file = (project?.files ?? []).find((f) => f.id === fileId);
    if (!file) return;
    dialog.show({
      title: "Delete File",
      message: `Are you sure you want to delete "${file.filename}"?`,
      confirmLabel: "Delete",
      onConfirm: () => deleteProjectFile(projectId as string, file),
    });
  };

  return (
    <>
      <DetailsWrapper>
        <DetailsWrapper.NavAction>
          <Pressable onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
          </Pressable>
        </DetailsWrapper.NavAction>
        <DetailsWrapper.Title>{name}</DetailsWrapper.Title>
        <DetailsWrapper.Subtitle>{status}</DetailsWrapper.Subtitle>
        <DetailsWrapper.HeaderAction>
          <Pressable
            onPress={() =>
              dialog.show({
                title: "Delete Project",
                message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
                confirmLabel: "Delete",
                onConfirm: async () => {
                  await deleteProject(projectId);
                  router.replace("/(contractor)/projects");
                },
              })
            }
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={24}
              color="red"
            />
          </Pressable>
        </DetailsWrapper.HeaderAction>
        <DetailsWrapper.Content>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <ProjectDescription
              description={project?.description}
              client_email={project?.client_email}
            />
            <ProjectAssets onUpload={handleUpload} />
            <UploadedFiles
              files={project?.files ?? []}
              onFileMenu={handleFileMenu}
            />
          </ScrollView>
        </DetailsWrapper.Content>
      </DetailsWrapper>
      <ConfirmDialog
        visible={dialog.visible}
        title={dialog.options?.title ?? ""}
        message={dialog.options?.message ?? ""}
        confirmLabel={dialog.options?.confirmLabel}
        cancelLabel={dialog.options?.cancelLabel}
        loading={dialog.loading}
        onConfirm={dialog.confirm}
        onCancel={dialog.hide}
      />
    </>
  );
}
