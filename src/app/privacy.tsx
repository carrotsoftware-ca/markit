import { useTheme } from "@/src/context/ThemeContext";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const LAST_UPDATED = "February 27, 2026";
const COMPANY = "Carrot Software Inc.";
const APP_NAME = "markit";
const CONTACT_EMAIL = "privacy@markitquote.com";

export default function PrivacyPolicy() {
  const { theme } = useTheme();
  const router = useRouter();

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray[200],
    },
    backButton: {
      marginRight: theme.spacing.md,
      padding: theme.spacing.xs,
    },
    backText: {
      color: theme.colors.primary,
      fontSize: theme.typography.fontSize.base,
      fontWeight: "600",
    },
    title: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize["2xl"],
      fontWeight: "700",
    },
    scroll: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing["3xl"],
      maxWidth: 720,
      alignSelf: "center",
      width: "100%",
    },
    updated: {
      color: theme.colors.text.muted,
      fontSize: theme.typography.fontSize.sm,
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.lg,
      fontWeight: "700",
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.sm,
    },
    body: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
    },
    bullet: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.relaxed,
      marginLeft: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    link: {
      color: theme.colors.primary,
    },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        {router.canGoBack() && (
          <Pressable style={s.backButton} onPress={() => router.back()}>
            <Text style={s.backText}>← Back</Text>
          </Pressable>
        )}
        <Text style={s.title}>Privacy Policy</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.updated}>Last updated: {LAST_UPDATED}</Text>

        <Text style={s.body}>
          {COMPANY} ("we", "our", or "us") operates the {APP_NAME} mobile application and website (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. Please read this policy carefully.
        </Text>

        <Text style={s.sectionTitle}>1. Information We Collect</Text>
        <Text style={s.body}>We may collect the following types of information:</Text>
        <Text style={s.bullet}>• <Text style={{ fontWeight: "600" }}>Account information</Text> — name, email address, and password when you create an account.</Text>
        <Text style={s.bullet}>• <Text style={{ fontWeight: "600" }}>Profile information</Text> — company name, phone number, and other details you provide.</Text>
        <Text style={s.bullet}>• <Text style={{ fontWeight: "600" }}>Project data</Text> — photos, videos, measurements, notes, and documents you upload.</Text>
        <Text style={s.bullet}>• <Text style={{ fontWeight: "600" }}>Usage data</Text> — device type, operating system, app interactions, and crash reports.</Text>
        <Text style={s.bullet}>• <Text style={{ fontWeight: "600" }}>Communications</Text> — messages sent through the Service, including portal links sent to clients.</Text>

        <Text style={s.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={s.body}>We use the information we collect to:</Text>
        <Text style={s.bullet}>• Provide, operate, and maintain the Service</Text>
        <Text style={s.bullet}>• Create and manage your account</Text>
        <Text style={s.bullet}>• Send project portal links and transactional emails to your clients</Text>
        <Text style={s.bullet}>• Improve and personalise the user experience</Text>
        <Text style={s.bullet}>• Monitor usage and diagnose technical issues</Text>
        <Text style={s.bullet}>• Comply with legal obligations</Text>

        <Text style={s.sectionTitle}>3. Sharing Your Information</Text>
        <Text style={s.body}>
          We do not sell your personal information. We may share information with third-party service providers who assist us in operating the Service (such as cloud hosting, authentication, and email delivery), subject to confidentiality agreements. We may also disclose information if required by law.
        </Text>

        <Text style={s.sectionTitle}>4. Data Storage and Security</Text>
        <Text style={s.body}>
          Your data is stored on Google Firebase infrastructure. We implement industry-standard security measures including encryption in transit (TLS) and at rest. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
        </Text>

        <Text style={s.sectionTitle}>5. Data Retention</Text>
        <Text style={s.body}>
          We retain your personal information for as long as your account is active or as needed to provide the Service. You may request deletion of your account and associated data at any time by contacting us.
        </Text>

        <Text style={s.sectionTitle}>6. Your Rights</Text>
        <Text style={s.body}>Depending on your jurisdiction, you may have the right to:</Text>
        <Text style={s.bullet}>• Access the personal information we hold about you</Text>
        <Text style={s.bullet}>• Request correction of inaccurate data</Text>
        <Text style={s.bullet}>• Request deletion of your data</Text>
        <Text style={s.bullet}>• Withdraw consent where processing is based on consent</Text>
        <Text style={s.body}>To exercise these rights, contact us at <Text style={s.link}>{CONTACT_EMAIL}</Text>.</Text>

        <Text style={s.sectionTitle}>7. Children's Privacy</Text>
        <Text style={s.body}>
          The Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.
        </Text>

        <Text style={s.sectionTitle}>8. Third-Party Services</Text>
        <Text style={s.body}>
          Our Service uses the following third-party services which have their own privacy policies: Google Firebase (authentication, database, storage, analytics), Google Sign-In, Apple Sign-In, and SendGrid (email delivery).
        </Text>

        <Text style={s.sectionTitle}>9. Changes to This Policy</Text>
        <Text style={s.body}>
          We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Last updated" date at the top of this page. Your continued use of the Service after changes constitutes acceptance of the updated policy.
        </Text>

        <Text style={s.sectionTitle}>10. Contact Us</Text>
        <Text style={s.body}>
          If you have any questions about this Privacy Policy, please contact us at:
        </Text>
        <Text style={s.body}>{COMPANY}</Text>
        <Text style={[s.body, s.link]}>{CONTACT_EMAIL}</Text>
        <Text style={s.body}>markitquote.com</Text>
      </ScrollView>
    </View>
  );
}
