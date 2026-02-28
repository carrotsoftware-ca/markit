import { ActivityEvent } from "@/src/types";
import React, { useEffect, useRef } from "react";
import { FlatList, StyleSheet } from "react-native";
import { CommentRow } from "./CommentRow";

interface ActivityFeedProps {
  events: ActivityEvent[];
  currentUserId: string;
}

export function ActivityFeed({ events, currentUserId }: ActivityFeedProps) {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (events.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [events.length]);

  return (
    <FlatList
      ref={flatListRef}
      data={events}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      renderItem={({ item }) => <CommentRow event={item} currentUserId={currentUserId} />}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
});
