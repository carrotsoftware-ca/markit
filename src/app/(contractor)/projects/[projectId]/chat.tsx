import DetailsWrapper from "@/src/components/ui/DetailsWrapper";
import { ActivityFeed } from "@/src/components/ui/activity/ActivityFeed";
import { MessageComposer } from "@/src/components/ui/activity/MessageComposer";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useActivity } from "@/src/hooks/useActivity";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

export default function ChatScreen() {
  const { projectId, name } = useLocalSearchParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const { events, isSending, send } = useActivity({
    projectId: projectId as string,
    visibility: "contractor",
    authorId: user?.id ?? "",
    authorName: user?.displayName ?? user?.email ?? "Contractor",
  });

  return (
    <DetailsWrapper>
      <DetailsWrapper.NavAction>
        <Pressable onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
        </Pressable>
      </DetailsWrapper.NavAction>
      <DetailsWrapper.Title>Chat</DetailsWrapper.Title>
      <DetailsWrapper.Subtitle>{name as string}</DetailsWrapper.Subtitle>
      <DetailsWrapper.Content>
        <View style={{ flex: 1 }}>
          <ActivityFeed events={events} currentUserId={user?.id ?? ""} />
          <MessageComposer onSend={send} isSending={isSending} />
        </View>
      </DetailsWrapper.Content>
    </DetailsWrapper>
  );
}
