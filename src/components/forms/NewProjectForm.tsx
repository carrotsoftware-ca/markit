import TextInput from "@/src/components/forms/inputs/TextInput";
import { useTheme } from "@/src/context/ThemeContext";
import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as yup from "yup";
import Button from "../ui/buttons/Button";

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
    <View >
      <Controller 
        control={control}
        name={"name"}
        render={({
          field: { onChange, value, onBlur },
          fieldState: { error },
        }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Name Of Project"
            error={!!error}
          />
        )}
      />
      <Controller 
        control={control}
        name={"description"}
        render={({
          field: { onChange, value, onBlur },
          fieldState: { error },
        }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Description of Project"
            error={!!error}
          />
        )}
      />
      <View>
        <Button onPress={ handleSubmit(onSubmit)} title={'Create Project'} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

});
