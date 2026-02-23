import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { TextInput as RNTextInput, StyleSheet, View } from "react-native";

function TextInput({ value, onChangeText, placeholder, style, ...props }) {
  const { theme, isDark } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = focused
    ? isDark
      ? theme.colors.safetyOrange
      : theme.colors.industrialBlack
    : theme.colors.gray[200];

  return (
    <View style={styles.inputContainer}>
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.gray[400]}
        style={[
          styles.input,
          {
            color: isDark ? "white" : "black",
            fontSize: 16,
            backgroundColor: isDark
              ? theme.colors.slateGray
              : theme.colors.safetyTint,
            borderWidth: 1,
            borderColor: theme.colors.safetyOrange,
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    borderRadius: 5,
  },
  input: {
    height: 40, // <-- move height here
    padding: 5,
    borderRadius: 5,
  },
});

export default TextInput;
