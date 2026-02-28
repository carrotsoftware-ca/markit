import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import DetailsWrapper from "@/src/components/ui/DetailsWrapper";
import { ProjectAssets, UploadedFiles } from "@/src/components/ui/projects";
import { useAuth } from "@/src/context/AuthContext";
import { useProjects } from "@/src/context/ProjectsContext";
import { useTheme } from "@/src/context/ThemeContext";
import { takePhoto } from "@/src/hooks/useCamera";
import { useConfirmDialog } from "@/src/hooks/useConfirmDialog";
import { pickMedia } from "@/src/hooks/useMediaPicker";
import { deleteProjectFile, uploadProjectFile } from "@/src/services/projects";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, ScrollView } from "react-native";

export default function FilesScreen() {
  const { projectId, name } = useLocalSearchParams();
  const { watchProject, watchProjectFiles, files } = useProjects();
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const dialog = useConfirmDialog();

  useFocusEffect(
    useCallback(() => {
      const unsubProject = watchProject(projectId as string);
      const unsubFiles = watchProjectFiles(projectId as string);
      return () => {
        unsubProject();
        unsubFiles();
      };
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
      user?.id,
      user?.displayName,
    );
  };

  const handleCamera = async () => {
    const photo = await takePhoto();
    if (!photo) return;
    await uploadProjectFile(
      projectId as string,
      photo.uri,
      photo.filename,
      photo.mimeType,
      photo.fileSize,
      user?.id,
      user?.displayName,
    );
  };

  const handleFilePress = (fileId: string) => {
    router.push({
      pathname: "/(contractor)/projects/[projectId]/[fileId]",
      params: { projectId: projectId as string, fileId },
    });
  };

  const handleFileMenu = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;
    dialog.show({
      title: "Delete File",
      message: `Are you sure you want to delete "${file.filename}"?`,
      confirmLabel: "Delete",
      onConfirm: () => deleteProjectFile(projectId as string, file, user?.id, user?.displayName),
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
        <DetailsWrapper.Title>Files</DetailsWrapper.Title>
        <DetailsWrapper.Subtitle>{name as string}</DetailsWrapper.Subtitle>
        <DetailsWrapper.Content>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <ProjectAssets onUpload={handleUpload} onCamera={handleCamera} />
            <UploadedFiles
              files={files}
              onFileMenu={handleFileMenu}
              onFilePress={handleFilePress}
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
