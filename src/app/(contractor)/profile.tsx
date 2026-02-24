import DetailsWrapper from "@/src/components/ui/DetailsWrapper";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <DetailsWrapper>
      <DetailsWrapper.Title>
        {user?.displayName || "Profile"}
      </DetailsWrapper.Title>
      <DetailsWrapper.Subtitle>
        {user?.email ? `Email: ${user.email}` : "Manage your profile"}
      </DetailsWrapper.Subtitle>
      <DetailsWrapper.HeaderAction>
        <Pressable onPress={logout}>
          <MaterialCommunityIcons
            name="logout"
            size={24}
            color={theme.colors.safetyOrange}
          />
        </Pressable>
      </DetailsWrapper.HeaderAction>
      <DetailsWrapper.Content>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          {/* Additional profile content can go here */}
        </View>
      </DetailsWrapper.Content>
    </DetailsWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
});
