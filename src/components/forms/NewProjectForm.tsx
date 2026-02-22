import TextInput from "@/src/components/forms/inputs/TextInput";
import { useTheme } from "@/src/context/ThemeContext";
import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as yup from "yup";

const projectSchema = yup.object().shape({
  name: yup
    .string()
    .required("Project name is required")
    .max(50, "Max 50 characters"),
  description: yup
    .string()
    .required("Description is required")
    .max(200, "Max 200 characters"),
});

export default function NewProjectForm({ onSubmit }) {
  const { theme } = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(projectSchema),
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="name"
        render={({
          field: { onChange, value, onBlur },
          fieldState: { error },
        }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Name Of Project"
            autoCapitalize="none"
            maxLength={50}
            error={!!error}
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({
          field: { onChange, value, onBlur },
          fieldState: { error },
        }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Project Description"
            multiline
            maxLength={200}
            error={!!error}
            style={{ minHeight: 80 }}
          />
        )}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Create Project</Text>
      </TouchableOpacity>
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
