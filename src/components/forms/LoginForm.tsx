import TextInput from "@/src/components/forms/inputs/TextInput";
import loginSchema from "@/src/components/forms/validators/loginSchema";
import { useTheme } from "@/src/context/ThemeContext";
import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LoginForm({ onSubmit }) {
  const { theme } = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  return (
    <View style={styles.form}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>
        Sign in
      </Text>
      <Controller
        control={control}
        name="email"
        render={({
          field: { onChange, value, onBlur },
          fieldState: { error },
        }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            error={!!error}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({
          field: { onChange, value, onBlur },
          fieldState: { error },
        }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Password"
            secureTextEntry
            error={!!error}
          />
        )}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>
      {/* Add Google sign-in button here if needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: "100%",
    maxWidth: 320,
    alignSelf: "center",
    padding: 24,
    borderRadius: 12,
    backgroundColor: "#222",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#FF7A00",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
