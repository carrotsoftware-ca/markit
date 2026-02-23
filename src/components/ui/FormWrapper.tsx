import React from "react";
import { useTheme } from "@/src/context/ThemeContext";
import { StyleSheet, View } from "react-native";

import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import TextInput from "../forms/inputs/TextInput";

const FormWrapper = ({ children }) => {
  const {isDark} = useTheme();

  return( 
    <KeyboardAwareScrollView style={styles.container}>
      {children}
    </KeyboardAwareScrollView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default FormWrapper
