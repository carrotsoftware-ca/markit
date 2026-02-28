import { useTheme } from "@/src/context/ThemeContext";
import {
  ActivityEvent,
  FileDeletedEvent,
  QuoteAcceptedEvent,
  QuoteRejectedEvent,
  QuoteRevisionRequestedEvent,
  QuoteSentEvent,
  VideoAnalysedEvent,
} from "@/src/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CommentRowProps {
  event: ActivityEvent;
  currentUserId: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Returns { body, icon?, iconColor?, isSystem }
function getContent(event: ActivityEvent): {
  authorLabel: string;
  body: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor?: string;
  isSystem: boolean;
} {
  switch (event.type) {
    case "message":
      return {
        authorLabel: event.authorName ?? "Unknown",
        body: event.text,
        isSystem: false,
      };

    case "file_uploaded":
      return {
        authorLabel: event.authorName ?? "Unknown",
        body: `uploaded ${event.payload.fileType === "video" ? "a video" : "a file"} — ${event.payload.filename}`,
        icon: event.payload.fileType === "video" ? "video-outline" : "paperclip",
        iconColor: "#5b8dee",
        isSystem: true,
      };

    case "file_deleted":
      return {
        authorLabel: event.authorName ?? "Unknown",
        body: `deleted a file — ${(event as FileDeletedEvent).payload.filename}`,
        icon: "trash-can-outline",
        iconColor: "#e74c3c",
        isSystem: true,
      };

    case "video_analysed":
      return {
        authorLabel: "markit AI",
        body: `Analysis complete — ${(event as VideoAnalysedEvent).payload.categories.join(", ")}`,
        icon: "robot-outline",
        iconColor: "#9b59b6",
        isSystem: true,
      };

    case "quote_sent":
      return {
        authorLabel: event.authorName ?? "Contractor",
        body: `sent Quote v${(event as QuoteSentEvent).payload.version}`,
        icon: "file-document-outline",
        iconColor: "#f39c12",
        isSystem: true,
      };

    case "quote_accepted":
      return {
        authorLabel: event.authorName ?? "Client",
        body: `accepted Quote v${(event as QuoteAcceptedEvent).payload.version}`,
        icon: "check-circle-outline",
        iconColor: "#2ecc71",
        isSystem: true,
      };

    case "quote_rejected":
      return {
        authorLabel: event.authorName ?? "Client",
        body: `declined Quote v${(event as QuoteRejectedEvent).payload.version}`,
        icon: "close-circle-outline",
        iconColor: "#e74c3c",
        isSystem: true,
      };

    case "quote_revision_requested": {
      const msg = (event as QuoteRevisionRequestedEvent).payload.message;
      return {
        authorLabel: event.authorName ?? "Client",
        body: `requested revisions — "${msg}"`,
        icon: "pencil-circle-outline",
        iconColor: "#f39c12",
        isSystem: true,
      };
    }

    default:
      return {
        authorLabel: event.authorName ?? "System",
        body: event.type,
        isSystem: true,
      };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CommentRow({ event, currentUserId }: CommentRowProps) {
  const { theme } = useTheme();
  const isMine = event.authorId === currentUserId;
  const content = getContent(event);

  const avatarBg = content.isSystem
    ? (content.iconColor ?? "#888") + "22"
    : isMine
      ? theme.colors.safetyOrange + "22"
      : theme.colors.border;

  const avatarFg = content.isSystem
    ? (content.iconColor ?? "#888")
    : isMine
      ? theme.colors.safetyOrange
      : theme.colors.text.primary;

  return (
    <View style={styles.row}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        {content.isSystem && content.icon ? (
          <MaterialCommunityIcons name={content.icon} size={16} color={avatarFg} />
        ) : (
          <Text style={[styles.avatarText, { color: avatarFg }]}>
            {initials(content.authorLabel)}
          </Text>
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.author,
              {
                color: content.isSystem
                  ? (content.iconColor ?? theme.colors.text.secondary)
                  : theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily.bold,
              },
            ]}
          >
            {content.authorLabel}
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
            {formatTime(event.createdAt)}
          </Text>
        </View>

        <Text
          style={[
            styles.text,
            {
              color: content.isSystem ? theme.colors.text.secondary : theme.colors.text.primary,
              fontFamily: theme.typography.fontFamily.regular,
              fontStyle: content.isSystem ? "italic" : "normal",
            },
          ]}
        >
          {content.body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 16,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  body: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 3,
  },
  author: {
    fontSize: 13,
    fontWeight: "600",
  },
  time: {
    fontSize: 11,
    opacity: 0.6,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});
