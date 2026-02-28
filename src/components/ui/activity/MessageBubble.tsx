import { useTheme } from "@/src/context/ThemeContext";
import { MessageEvent } from "@/src/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MessageBubbleProps {
  event: MessageEvent;
  /** The current user's UID — determines left (theirs) vs right (mine) alignment. */
  currentUserId: string;
}

export function MessageBubble({ event, currentUserId }: MessageBubbleProps) {
  const { theme } = useTheme();
  const isMine = event.authorId === currentUserId;

  const time = new Date(event.createdAt).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <View style={[styles.wrapper, isMine ? styles.wrapperRight : styles.wrapperLeft]}>
      {!isMine && (
        <Text
          style={[
            styles.author,
            { color: theme.colors.text.secondary, fontFamily: theme.typography.fontFamily.bold },
          ]}
        >
          {event.authorName ?? "Client"}
        </Text>
      )}
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isMine
              ? theme.colors.safetyOrange
              : (theme.colors.surface ?? "#1e1e1e"),
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: isMine ? "#fff" : theme.colors.text.primary,
              fontFamily: theme.typography.fontFamily.regular,
            },
          ]}
        >
          {event.text}
        </Text>
      </View>
      <Text
        style={[
          styles.time,
          {
            color: theme.colors.text.secondary,
            fontFamily: theme.typography.fontFamily.regular,
            alignSelf: isMine ? "flex-end" : "flex-start",
          },
        ]}
      >
        {time}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    maxWidth: "78%",
    marginBottom: 12,
  },
  wrapperRight: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  wrapperLeft: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  author: {
    fontSize: 11,
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  time: {
    fontSize: 10,
    marginTop: 3,
    opacity: 0.6,
  },
});
