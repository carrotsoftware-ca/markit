import { useAuth } from "@/src/context/AuthContext";
import { Button, Text, View } from "react-native";

export default function Profile() {
  const { logout } = useAuth();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Profile</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
