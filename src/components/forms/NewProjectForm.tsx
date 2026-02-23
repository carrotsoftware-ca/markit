import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";
import * as yup from "yup";

import { useTheme } from "@/src/context/ThemeContext";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import Button from "../ui/buttons/Button";
import InputWrapper from "./inputs/InputWrapper";
import TextInput from "./inputs/TextInput";
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
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(projectSchema),
  });

  const handleExit = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to exit? All unsaved changes will be lost.",
      );
      if (confirmed) {
        router.replace("/(contractor)/projects");
      }
    } else {
      Alert.alert(
        "Discard changes?",
        "Are you sure you want to exit? All unsaved changes will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Exit",
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Controller
          control={control}
          name={"name"}
          render={({
            field: { onChange, value, onBlur },
            fieldState: { error },
          }) => (
            <InputWrapper title={"Name of Project"} error={error}>
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Name Of Project"
                error={!!error}
              />
            </InputWrapper>
          )}
        />
        <Controller
          control={control}
          name={"description"}
          render={({
            field: { onChange, value, onBlur },
            fieldState: { error },
          }) => (
            <InputWrapper title={"Description"} error={error}>
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Description of Project"
                multiline // <-- add this
                numberOfLines={4} // optional, sets visible lines
                error={!!error}
                style={{
                  height: 130,
                }}
              />
            </InputWrapper>
          )}
        />
      </View>
      <View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 0.4 }}>
            <Button title={"Exit"} onPress={handleExit} />
          </View>
          <View style={{ flex: 0.6, marginLeft: 20 }}>
            <Button title={"Create Project"} onPress={handleSubmit(onSubmit)} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
