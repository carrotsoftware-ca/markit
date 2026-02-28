import { useTheme } from "@/src/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

interface MessageComposerProps {
  onSend: (text: string) => Promise<void>;
  isSending: boolean;
}

export function MessageComposer({ onSend, isSending }: MessageComposerProps) {
  const { theme } = useTheme();
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim() || isSending) return;
    await onSend(text);
    setText("");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface ?? "#1e1e1e",
          borderTopColor: theme.colors.text.secondary + "22",
        },
      ]}
    >
      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          placeholderTextColor={theme.colors.text.secondary}
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.background,
              color: theme.colors.text.primary,
              fontFamily: theme.typography.fontFamily.regular,
              borderColor: theme.colors.text.secondary + "33",
            },
          ]}
          multiline
          maxLength={2000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Pressable
          onPress={handleSend}
          disabled={!text.trim() || isSending}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor: theme.colors.safetyOrange,
              opacity: pressed || !text.trim() || isSending ? 0.5 : 1,
            },
          ]}
        >
          <MaterialCommunityIcons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
