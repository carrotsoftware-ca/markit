import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import FloatingActionButton from "@/src/components/ui/buttons/FloatingActionButton";
import LargeCard from "@/src/components/ui/cards/LargeCard";
import { useTheme } from "@/src/context/ThemeContext";
import { Link, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const dummyProjects = [
  {
    id: "1",
    title: "Q3 Marketing Deck",
    description:
      "Preparation for the quarterly review including brand refresh mockups and user growth charts.",
    status: "In Progress",
    statusColor: "#2D5BFF",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    title: "Portfolio Redesign",
    description:
      "Updating the personal portfolio website with the latest project case studies and dark mode…",
    status: "Completed",
    statusColor: "#1DB954",
    timestamp: "Yesterday",
  },
  {
    id: "3",
    title: "Mobile App Wireframes",
    description:
      "Initial brainstorming and low-fidelity wireframes for a new fitness tracking application.",
    status: "Draft",
    statusColor: "#6C7380",
    timestamp: "Oct 12, 2023",
  },
  {
    id: "4",
    title: "Website Analytics Dashboard",
    description: "Building a dashboard for real-time analytics and reporting.",
    status: "In Progress",
    statusColor: "#2D5BFF",
    timestamp: "3 days ago",
  },
  {
    id: "5",
    title: "Brand Guidelines",
    description: "Documenting the new brand guidelines for the design team.",
    status: "Completed",
    statusColor: "#1DB954",
    timestamp: "Feb 10, 2026",
  },
  {
    id: "6",
    title: "User Feedback Survey",
    description: "Drafting and distributing a survey to collect user feedback.",
    status: "Draft",
    statusColor: "#6C7380",
    timestamp: "Feb 8, 2026",
  },
  {
    id: "7",
    title: "API Integration",
    description: "Integrating third-party APIs for payment and notifications.",
    status: "In Progress",
    statusColor: "#2D5BFF",
    timestamp: "1 week ago",
  },
  {
    id: "8",
    title: "Team Onboarding Docs",
    description: "Creating onboarding documentation for new team members.",
    status: "Completed",
    statusColor: "#1DB954",
    timestamp: "Jan 30, 2026",
  },
  {
    id: "9",
    title: "Dark Mode Support",
    description: "Implementing dark mode across all screens and components.",
    status: "In Progress",
    statusColor: "#2D5BFF",
    timestamp: "Jan 25, 2026",
  },
  {
    id: "10",
    title: "Accessibility Review",
    description:
      "Reviewing the app for accessibility improvements and compliance.",
    status: "Draft",
    statusColor: "#6C7380",
    timestamp: "Jan 20, 2026",
  },
];

export default function ProjectsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <AuthScreenWrapper
      title="Projects"
      subtitle="You can find all your projects here"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {dummyProjects.map((item, idx) => (
          <Link
            key={item.id}
            href={{
              pathname: `/projects/${item.id}?name=${item.title}&status=${item.status}`,
            }}
            asChild
          >
            <LargeCard
              title={item.title}
              description={item.description}
              status={item.status}
              statusColor={item.statusColor}
              timestamp={item.timestamp}
            />
          </Link>
        ))}
      </ScrollView>
      <FloatingActionButton
        onPress={() => {
          // Open the add project modal
          router.push("/projects/add-project");
        }}
      />
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
