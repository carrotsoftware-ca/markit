import { useAuth } from "@/src/context/AuthContext";
import { Button, StyleSheet, Text, View } from "react-native";

export default () => {
  const { login } = useAuth();
  return (
    <View style={styles.container}>
      <Text>Login</Text>
      <Button title="Login" onPress={login} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "pink",
  },
});
