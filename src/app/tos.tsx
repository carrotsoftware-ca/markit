import { useTheme } from "@/src/context/ThemeContext";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const LAST_UPDATED = "March 2, 2026";
const COMPANY = "Carrot Software Inc.";
const APP_NAME = "markit";
const CONTACT_EMAIL = "support@markitquote.com";

export default function TermsOfService() {
  const { theme } = useTheme();
  const router = useRouter();

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.industrialBlack,
    },
    scroll: {
      padding: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    backButton: {
      marginRight: 16,
    },
    title: {
      fontSize: theme.typography.fontSize["2xl"],
      fontFamily: theme.typography.fontFamily.bold,
      color: "#FFF",
    },
    lastUpdated: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.gray[400],
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: "#FFF",
      marginTop: 24,
      marginBottom: 12,
    },
    body: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.gray[300],
      lineHeight: 20,
      marginBottom: 12,
    },
    link: {
      color: theme.colors.safetyOrange,
      textDecorationLine: "underline",
    },
  });

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll}>
        <Text style={s.title}>Terms of Service</Text>
        <Text style={s.lastUpdated}>Last updated: {LAST_UPDATED}</Text>

        <Text style={s.body}>
          Please read these Terms of Service ("Terms", "Terms of Service") carefully before using
          the {APP_NAME} mobile application (the "Service") operated by {COMPANY} ("us", "we", or
          "our").
        </Text>

        <Text style={s.body}>
          Your access to and use of the Service is conditioned on your acceptance of and compliance
          with these Terms. These Terms apply to all visitors, users, and others who access or use
          the Service.
        </Text>

        <Text style={s.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={s.body}>
          By accessing or using the Service you agree to be bound by these Terms. If you disagree
          with any part of the terms then you may not access the Service.
        </Text>

        <Text style={s.sectionTitle}>2. Use of the Service</Text>
        <Text style={s.body}>
          You agree not to use the Service for any unlawful purpose or in any way that interrupts,
          damages, or impairs the service. You are responsible for your conduct and any data, text,
          information, and other content that you submit, post, and display on the Service.
        </Text>

        <Text style={s.sectionTitle}>3. Accounts</Text>
        <Text style={s.body}>
          When you create an account with us, you must provide us with information that is accurate,
          complete, and current at all times. Failure to do so constitutes a breach of the Terms,
          which may result in immediate termination of your account on our Service.
        </Text>

        <Text style={s.sectionTitle}>4. Intellectual Property</Text>
        <Text style={s.body}>
          The Service and its original content, features, and functionality are and will remain the
          exclusive property of {COMPANY} and its licensors.
        </Text>

        <Text style={s.sectionTitle}>5. Termination</Text>
        <Text style={s.body}>
          We may terminate or suspend your account immediately, without prior notice or liability,
          for any reason whatsoever, including without limitation if you breach the Terms.
        </Text>

        <Text style={s.sectionTitle}>6. Limitation of Liability</Text>
        <Text style={s.body}>
          In no event shall {COMPANY}, nor its directors, employees, partners, agents, suppliers, or
          affiliates, be liable for any indirect, incidental, special, consequential or punitive
          damages, including without limitation, loss of profits, data, use, goodwill, or other
          intangible losses, resulting from your access to or use of or inability to access or use
          the Service.
        </Text>

        <Text style={s.sectionTitle}>7. Governing Law</Text>
        <Text style={s.body}>
          These Terms shall be governed and construed in accordance with the laws of the
          jurisdiction in which {COMPANY} is located, without regard to its conflict of law
          provisions.
        </Text>

        <Text style={s.sectionTitle}>8. Changes to Terms</Text>
        <Text style={s.body}>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any
          time. We will provide at least 30 days' notice prior to any new terms taking effect.
        </Text>

        <Text style={s.sectionTitle}>9. Contact Us</Text>
        <Text style={s.body}>
          If you have any questions about these Terms, please contact us at:
        </Text>
        <Text style={s.body}>{CONTACT_EMAIL}</Text>
      </ScrollView>
    </View>
  );
}
