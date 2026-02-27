// app.config.js
export default ({ config }) => ({
  expo: {
    name: "markit",
    slug: "markit",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icons/icon.png",
    scheme: "markit",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    assetBundlePatterns: [
      "assets/fonts/**",
      "node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/**",
    ],
    ios: {
      bundleIdentifier: "com.carrotsoftware.markit",
      googleServicesFile: "./src/services/firebase/GoogleService-Info.plist",
      supportsTablet: true,
      usesAppleSignIn: true,
      associatedDomains: [
        "applinks:markitquote.com",
        "applinks:www.markitquote.com",
        "applinks:markitquote.com",
        "applinks:www.markitquote.com",
      ],
      appleTeamId: "9CTMYS84XH",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSPhotoLibraryUsageDescription:
          "Allow markit to access your photo library to upload images and videos to your projects.",
        NSMicrophoneUsageDescription: "Allow markit to access your microphone for video uploads.",
        NSCameraUsageDescription:
          "Allow markit to access your camera to photograph job sites for measurement.",
      },
    },
    android: {
      googleServicesFile: "./src/services/firebase/google-services.json",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.carrotsoftware.markit",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "markitquote.com",
              pathPrefix: "/portal/",
            },
            {
              scheme: "https",
              host: "www.markitquote.com",
              pathPrefix: "/portal/",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "markitquote.com",
              path: "/validate/password",
            },
            {
              scheme: "https",
              host: "www.markitquote.com",
              path: "/validate/password",
            },
            {
              scheme: "https",
              host: "markitquote.com",
              path: "/reset/password",
            },
            {
              scheme: "https",
              host: "www.markitquote.com",
              path: "/reset/password",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      output: "static",
      favicon: "./assets/icons/favicon.png",
    },
    plugins: [
      ["@react-native-google-signin/google-signin"],
      ["expo-apple-authentication"],
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/crashlytics",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
            forceStaticLinking: ["RNFBApp", "RNFBAuth", "RNFBCrashlytics"],
          },
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow markit to access your photo library to upload images and videos to your projects.",
          microphonePermission: "Allow markit to access your microphone for video uploads.",
          cameraPermission:
            "Allow markit to access your camera to photograph job sites for measurement.",
        },
      ],
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/icons/icon.png",
          resizeMode: "contain",
          backgroundColor: "#111727",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "@react-native-google-signin/google-signin",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "45891199-d9b9-4bf0-9108-8042dcb73e10",
      },
    },
  },
});
