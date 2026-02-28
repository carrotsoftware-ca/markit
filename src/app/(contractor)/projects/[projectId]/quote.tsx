import DetailsWrapper from "@/src/components/ui/DetailsWrapper";
import { QuoteEditor } from "@/src/components/ui/quote/QuoteEditor";
import { useAuth } from "@/src/context/AuthContext";
import { useProjects } from "@/src/context/ProjectsContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useQuote } from "@/src/hooks/useQuote";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Pressable } from "react-native";

export default function QuoteScreen() {
  const { projectId, name } = useLocalSearchParams();
  const { watchProject, watchProjectFiles, files } = useProjects();
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

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

  const {
    lineItems,
    currency,
    quote,
    isSaving,
    isSending,
    updateLineItem,
    addLineItem,
    removeLineItem,
    send,
  } = useQuote(
    projectId as string,
    files,
    user?.id ?? "",
    user?.displayName ?? user?.email ?? "Contractor",
  );

  return (
    <DetailsWrapper>
      <DetailsWrapper.NavAction>
        <Pressable onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
        </Pressable>
      </DetailsWrapper.NavAction>
      <DetailsWrapper.Title>Quote</DetailsWrapper.Title>
      <DetailsWrapper.Subtitle>{name as string}</DetailsWrapper.Subtitle>
      <DetailsWrapper.Content>
        <QuoteEditor
          lineItems={lineItems}
          currency={currency}
          status={quote?.status ?? "draft"}
          isSaving={isSaving}
          isSending={isSending}
          onUpdateLineItem={updateLineItem}
          onAddLineItem={addLineItem}
          onRemoveLineItem={removeLineItem}
          onSend={send}
        />
      </DetailsWrapper.Content>
    </DetailsWrapper>
  );
}
