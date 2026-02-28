import { useTheme } from "@/src/context/ThemeContext";
import {
  ActivityEvent,
  QuoteAcceptedEvent,
  QuoteRejectedEvent,
  QuoteRevisionRequestedEvent,
  QuoteSentEvent,
  VideoAnalysedEvent,
} from "@/src/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface SystemEventRowProps {
  event: Exclude<ActivityEvent, { type: "message" }>;
}

function getEventConfig(event: SystemEventRowProps["event"]): {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
  label: string;
} {
  switch (event.type) {
    case "file_uploaded":
      return {
        icon: event.payload.fileType === "video" ? "video-outline" : "file-upload-outline",
        color: "#5b8dee",
        label: `${event.payload.fileType === "video" ? "Video" : "File"} uploaded — ${event.payload.filename}`,
      };
    case "video_analysed":
      return {
        icon: "robot-outline",
        color: "#9b59b6",
        label: `AI analysis complete — ${(event as VideoAnalysedEvent).payload.categories.join(", ")}`,
      };
    case "quote_sent":
      return {
        icon: "file-document-outline",
        color: "#f39c12",
        label: `Quote v${(event as QuoteSentEvent).payload.version} sent`,
      };
    case "quote_accepted":
      return {
        icon: "check-circle-outline",
        color: "#2ecc71",
        label: `Quote v${(event as QuoteAcceptedEvent).payload.version} accepted`,
      };
    case "quote_rejected":
      return {
        icon: "close-circle-outline",
        color: "#e74c3c",
        label: `Quote v${(event as QuoteRejectedEvent).payload.version} rejected`,
      };
    case "quote_revision_requested": {
      const msg = (event as QuoteRevisionRequestedEvent).payload.message;
      return {
        icon: "pencil-circle-outline",
        color: "#f39c12",
        label: `Revisions requested — "${msg}"`,
      };
    }
  }
}

export function SystemEventRow({ event }: SystemEventRowProps) {
  const { theme } = useTheme();
  const config = getEventConfig(event);

  const time = new Date(event.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: config.color + "22" }]}>
        <MaterialCommunityIcons name={config.icon} size={16} color={config.color} />
      </View>
      <View style={styles.content}>
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text.primary,
              fontFamily: theme.typography.fontFamily.regular,
            },
          ]}
        >
          {config.label}
        </Text>
        <Text
          style={[
            styles.time,
            {
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.fontFamily.regular,
            },
          ]}
        >
          {time}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
    opacity: 0.75,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  content: {
    flexShrink: 1,
  },
  label: {
    fontSize: 12,
  },
  time: {
    fontSize: 10,
    marginTop: 1,
    opacity: 0.7,
  },
});
