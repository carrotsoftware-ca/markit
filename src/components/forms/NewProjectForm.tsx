import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";

import Button from "@/src/components/ui/buttons/Button";
import { useTheme } from "@/src/context/ThemeContext";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import InputWrapper from "./inputs/InputWrapper";
import TextInput from "./inputs/TextInput";
import ToggleWrapper from "./inputs/ToggleWrapper";

import newProjectSchema from "./validators/newProjectSchema";

export default function NewProjectForm({ onSubmit }) {
  const { theme } = useTheme();
  const router = useRouter();
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [notifications, setNotifications] = React.useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(newProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      client_email: "",
      emailNotifications: true,
      notifications: false,
    },
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
  const handleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications);
  };
  const handleNotifications = () => {
    setNotifications(!notifications);
  };
  return (
    <View style={{ flex: 1 }}>
      <KeyboardAwareScrollView>
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
        <Controller
          control={control}
          name={"client_email"}
          render={({
            field: { onChange, value, onBlur },
            fieldState: { error },
          }) => (
            <InputWrapper title={"Client Email"} error={error}>
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize={"none"}
                placeholder="Contact of client"
                numberOfLines={4} // optional, sets visible lines
                error={!!error}
              />
            </InputWrapper>
          )}
        />
        <View style={{ marginTop: 30, gap: 10 }}>
          <Controller
            control={control}
            name="emailNotifications"
            render={({ field: { value, onChange } }) => (
              <ToggleWrapper
                title="Email Notifications"
                subtitle="Receive updates via email"
                icon="email"
                value={value}
                onValueChange={onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="notifications"
            render={({ field: { value, onChange } }) => (
              <ToggleWrapper
                title="Push Notifications"
                subtitle="Alerts on your device"
                icon="notifications"
                value={value}
                onValueChange={onChange}
              />
            )}
          />
        </View>
      </KeyboardAwareScrollView>
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
