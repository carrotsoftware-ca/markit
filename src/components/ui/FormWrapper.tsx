import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const FormWrapper = ({ children, style, ...props }) => {
  const { isDark } = useTheme();

  return <KeyboardAvoidingView style={style}>{children}</KeyboardAvoidingView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default FormWrapper;
