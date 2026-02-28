import { ActivityEvent } from "@/src/types";
import React, { useEffect, useRef } from "react";
import { FlatList, ScrollView, StyleSheet } from "react-native";
import { CommentRow } from "./CommentRow";
import { MessageBubble } from "./MessageBubble";

interface ActivityFeedProps {
  events: ActivityEvent[];
  currentUserId: string;
  /** Use ScrollView instead of FlatList — required when nested inside another ScrollView (e.g. portal) */
  useScrollView?: boolean;
}

function renderEvent(item: ActivityEvent, currentUserId: string) {
  return item.type === "message" ? (
    <MessageBubble key={item.id} event={item as any} currentUserId={currentUserId} />
  ) : (
    <CommentRow key={item.id} event={item} currentUserId={currentUserId} />
  );
}

export function ActivityFeed({ events, currentUserId, useScrollView = false }: ActivityFeedProps) {
  const flatListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (events.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [events.length]);

  if (useScrollView) {
    return (
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {events.map((item) => renderEvent(item, currentUserId))}
      </ScrollView>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={events}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      renderItem={({ item }) => renderEvent(item, currentUserId)}
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
