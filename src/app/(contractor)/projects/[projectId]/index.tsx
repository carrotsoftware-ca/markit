import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import DetailsWrapper from "@/src/components/ui/DetailsWrapper";
import { ActivityFeed, MessageComposer } from "@/src/components/ui/activity";
import {
  ProjectAssets,
  ProjectDescription,
  ProjectPortalCard,
  ProjectTab,
  ProjectTabBar,
  UploadedFiles,
} from "@/src/components/ui/projects";
import { QuoteEditor } from "@/src/components/ui/quote/QuoteEditor";
import { useAuth } from "@/src/context/AuthContext";
import { useProjects } from "@/src/context/ProjectsContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useActivity } from "@/src/hooks/useActivity";
import { takePhoto } from "@/src/hooks/useCamera";
import { useConfirmDialog } from "@/src/hooks/useConfirmDialog";
import { pickMedia } from "@/src/hooks/useMediaPicker";
import { useQuote } from "@/src/hooks/useQuote";
import { deleteProjectFile, sendPortalInvite, uploadProjectFile } from "@/src/services/projects";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";

export default function ProjectDetailsScreen() {
  const { projectId, name, status } = useLocalSearchParams();
  const { deleteProject, watchProject, watchProjectFiles, project, files } = useProjects();
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const dialog = useConfirmDialog();
  const [inviting, setInviting] = useState(false);
  const [activeTab, setActiveTab] = useState<ProjectTab>("feed");

  const { events, send, isSending } = useActivity({
    projectId: projectId as string,
    visibility: "contractor",
    authorId: user?.id ?? "",
    authorName: user?.displayName ?? user?.email ?? "Contractor",
  });

  const {
    lineItems,
    currency,
    quote,
    isSaving: isQuoteSaving,
    isSending: isQuoteSending,
    updateLineItem,
    addLineItem,
    removeLineItem,
    send: sendQuote,
  } = useQuote(
    projectId as string,
    files,
    user?.id ?? "",
    user?.displayName ?? user?.email ?? "Contractor",
  );

  const handleInviteClient = async () => {
    if (!project?.client_email) {
      Alert.alert(
        "No client email",
        "Add a client email address to this project before sending an invite.",
      );
      return;
    }
    setInviting(true);
    try {
      await sendPortalInvite(projectId as string);
      Alert.alert("Invite sent!", `Portal link sent to ${project.client_email}.`);
    } catch (e: any) {
      Alert.alert("Failed to send invite", e?.message ?? "Please try again.");
    } finally {
      setInviting(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Subscribe to both the project document AND its files subcollection.
      // Both return unsubscribe functions; we call them both on cleanup.
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
          <Pressable onPress={handleInviteClient} disabled={inviting} style={{ marginRight: 16 }}>
            <MaterialCommunityIcons
              name="email-arrow-right-outline"
              size={24}
              color={inviting ? theme.colors.text.secondary : theme.colors.safetyOrange}
            />
          </Pressable>
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
            <MaterialCommunityIcons name="trash-can-outline" size={24} color="red" />
          </Pressable>
        </DetailsWrapper.HeaderAction>
        <DetailsWrapper.Content>
          <ProjectTabBar active={activeTab} onChange={setActiveTab} />

          {/* ── Feed ─────────────────────────────────────────────────────── */}
          {activeTab === "feed" && (
            <View style={{ flex: 1 }}>
              <ActivityFeed events={events} currentUserId={user?.id ?? ""} />
              <MessageComposer onSend={send} isSending={isSending} showInternalToggle />
            </View>
          )}

          {/* ── Files ────────────────────────────────────────────────────── */}
          {activeTab === "files" && (
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
          )}

          {/* ── Quote ────────────────────────────────────────────────────── */}
          {activeTab === "quote" && (
            <QuoteEditor
              lineItems={lineItems}
              currency={currency}
              status={quote?.status ?? "draft"}
              isSaving={isQuoteSaving}
              isSending={isQuoteSending}
              onUpdateLineItem={updateLineItem}
              onAddLineItem={addLineItem}
              onRemoveLineItem={removeLineItem}
              onSend={sendQuote}
            />
          )}

          {/* ── Access ───────────────────────────────────────────────────── */}
          {activeTab === "access" && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }}
            >
              <ProjectDescription
                description={project?.description}
                client_email={project?.client_email}
              />
              {project && <ProjectPortalCard project={project} projectId={projectId as string} />}
            </ScrollView>
          )}
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
