import { useTheme } from "@/src/context/ThemeContext";
import { useState } from "react";
import { TextInput as RNTextInput, StyleSheet, View } from "react-native";

function TextInput({ value, onChangeText, placeholder, ...props }) {
  const { theme, isDark } = useTheme();
  const [focused, setFocused] = useState(false);

  const underlineColor = focused
    ? isDark
      ? theme.colors.midnightBlue
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
            color: theme.colors.text.primary,
            fontFamily: theme.typography.fontFamily.regular,
          },
        ]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      <View
        style={{
          height: 2,
          backgroundColor: underlineColor,
          marginTop: 2,
          borderRadius: theme.borderRadius.full,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 12,
  },
  input: {
    fontSize: 18,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
});

export default TextInput;
