import { getPortalEvents, getPortalFiles, getProjectByToken } from "@/src/services/projects/getPortalProject";
import { MarkitEvent, MeasurementEvent, NormalizedPoint, Project, ProjectFile } from "@/src/types";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getActiveEvents(events: MarkitEvent[]): MarkitEvent[] {
  const deleted = new Set(
    events
      .filter((e) => e.type === "delete")
      .map((e) => (e as any).targetEventId as string),
  );
  return events.filter((e) => e.type !== "delete" && !deleted.has(e.id));
}

function getLatestCalibration(events: MarkitEvent[]) {
  const confirmed = events
    .filter((e) => e.type === "calibration_confirmed")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return confirmed[0] as (MarkitEvent & { intrinsicScale: number }) | undefined;
}

function distance(a: NormalizedPoint, b: NormalizedPoint, w: number, h: number) {
  const dx = (b.x - a.x) * w;
  const dy = (b.y - a.y) * h;
  return Math.sqrt(dx * dx + dy * dy);
}

function recomputeDistance(
  event: MeasurementEvent,
  intrinsicScale: number,
  imageW: number,
  imageH: number,
): string {
  const px = distance(event.start, event.end, imageW, imageH);
  const inches = px * intrinsicScale;
  const feet = Math.floor(inches / 12);
  const rem = inches % 12;
  if (feet === 0) return `${rem.toFixed(1)}in`;
  return `${feet}ft ${rem.toFixed(1)}in`;
}

// ---------------------------------------------------------------------------
// Measurement overlay (SVG drawn on top of an image)
// ---------------------------------------------------------------------------

interface OverlayProps {
  events: MarkitEvent[];
  imageWidth: number;
  imageHeight: number;
}

function MeasurementOverlay({ events, imageWidth, imageHeight }: OverlayProps) {
  if (imageWidth === 0 || imageHeight === 0) return null;

  const active = getActiveEvents(events);
  const calibration = getLatestCalibration(active);
  const measurements = active.filter(
    (e) => e.type === "measurement",
  ) as MeasurementEvent[];

  return (
    // @ts-ignore — svg is valid HTML on web
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: imageWidth,
        height: imageHeight,
        pointerEvents: "none",
      }}
      width={imageWidth}
      height={imageHeight}
    >
      {measurements.map((m) => {
        const x1 = m.start.x * imageWidth;
        const y1 = m.start.y * imageHeight;
        const x2 = m.end.x * imageWidth;
        const y2 = m.end.y * imageHeight;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;

        const label = calibration
          ? recomputeDistance(m, calibration.intrinsicScale, imageWidth, imageHeight)
          : m.distanceText;

        return (
          // @ts-ignore
          <g key={m.id}>
            {/* Line */}
            {/* @ts-ignore */}
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#FF6B00"
              strokeWidth={2}
              strokeLinecap="round"
            />
            {/* End caps */}
            {/* @ts-ignore */}
            <circle cx={x1} cy={y1} r={4} fill="#FF6B00" />
            {/* @ts-ignore */}
            <circle cx={x2} cy={y2} r={4} fill="#FF6B00" />
            {/* Label background */}
            {/* @ts-ignore */}
            <rect
              x={mx - 28} y={my - 11}
              width={56} height={18}
              rx={4} ry={4}
              fill="rgba(0,0,0,0.65)"
            />
            {/* Label text */}
            {/* @ts-ignore */}
            <text
              x={mx} y={my + 4}
              textAnchor="middle"
              fill="white"
              fontSize={11}
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// File card with image + overlay
// ---------------------------------------------------------------------------

interface FileCardProps {
  file: ProjectFile;
  events: MarkitEvent[];
}

function FileCard({ file, events }: FileCardProps) {
  const containerRef = useRef<View>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  if (!file.url) return null;

  const hasMeasurements = getActiveEvents(events).some(
    (e) => e.type === "measurement",
  );

  return (
    <View style={styles.fileCard}>
      <Text style={styles.fileLabel}>{file.name || file.filename}</Text>
      <View
        // @ts-ignore
        ref={containerRef}
        style={styles.imageContainer}
        onLayout={(e) => {
          const { width } = e.nativeEvent.layout;
          // maintain aspect ratio — default to 9:16 until image loads
          Image.getSize(
            file.url!,
            (iw, ih) => setDims({ width, height: (ih / iw) * width }),
            () => setDims({ width, height: width * (9 / 16) }),
          );
        }}
      >
        {dims.width > 0 && (
          <>
            <Image
              source={{ uri: file.url }}
              style={{ width: dims.width, height: dims.height }}
              resizeMode="contain"
            />
            {hasMeasurements && (
              <MeasurementOverlay
                events={events}
                imageWidth={dims.width}
                imageHeight={dims.height}
              />
            )}
          </>
        )}
      </View>
      {file.notes ? (
        <Text style={styles.fileNotes}>{file.notes}</Text>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Portal page
// ---------------------------------------------------------------------------

type FileWithEvents = { file: ProjectFile; events: MarkitEvent[] };

export default function PortalPage() {
  const { token } = useLocalSearchParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [revoked, setRevoked] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<FileWithEvents[]>([]);

  useEffect(() => {
    if (!token) return;

    (async () => {
      setLoading(true);
      try {
        const proj = await getProjectByToken(token);
        if (!proj) {
          setRevoked(true);
          return;
        }
        setProject(proj);

        const files = await getPortalFiles(proj.id);
        const doneFiles = files.filter((f) => f.status === "done");

        const withEvents = await Promise.all(
          doneFiles.map(async (file) => {
            const events = await getPortalEvents(proj.id, file.id);
            return { file, events };
          }),
        );
        setItems(withEvents);
      } catch {
        setRevoked(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Set document title on web
  useLayoutEffect(() => {
    if (typeof document !== "undefined" && project?.name) {
      document.title = `${project.name} — markit!`;
    }
  }, [project?.name]);

  if (loading) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (revoked || !project) {
    return (
      <View style={styles.centred}>
        <Text style={styles.revokedIcon}>🔒</Text>
        <Text style={styles.revokedTitle}>Access Revoked</Text>
        <Text style={styles.revokedSub}>
          This link is no longer active. Contact your contractor for a new invite.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          markit<Text style={styles.logoAccent}>!</Text>
        </Text>
      </View>

      {/* Project info */}
      <View style={styles.projectMeta}>
        <Text style={styles.projectName}>{project.name}</Text>
        {project.description ? (
          <Text style={styles.projectDesc}>{project.description}</Text>
        ) : null}
        <View style={[styles.statusBadge, styles[`status_${project.status ?? "draft"}`]]}>
          <Text style={styles.statusText}>{project.status ?? "draft"}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Files */}
      {items.length === 0 ? (
        <Text style={styles.emptyText}>No files have been added to this project yet.</Text>
      ) : (
        items.map(({ file, events }) => (
          <FileCard key={file.id} file={file} events={events} />
        ))
      )}

      <Text style={styles.footer}>Powered by markit!</Text>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BG = "#1a1a1a";
const CARD = "#242424";
const ORANGE = "#FF6B00";
const TEXT = "#ffffff";
const MUTED = "#888888";

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: BG },
  pageContent: { maxWidth: 680, alignSelf: "center", width: "100%" as any, paddingBottom: 64 },

  centred: { flex: 1, backgroundColor: BG, alignItems: "center", justifyContent: "center", padding: 32 },

  header: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16 },
  logo: { fontSize: 28, fontWeight: "900", color: TEXT, letterSpacing: -1 },
  logoAccent: { color: ORANGE },

  projectMeta: { paddingHorizontal: 24, paddingBottom: 16 },
  projectName: { fontSize: 26, fontWeight: "bold", color: TEXT, marginBottom: 6 },
  projectDesc: { fontSize: 15, color: MUTED, marginBottom: 12 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  status_active: { backgroundColor: "rgba(34,197,94,0.15)" },
  status_draft: { backgroundColor: "rgba(234,179,8,0.15)" },
  status_completed: { backgroundColor: "rgba(100,100,100,0.2)" },
  statusText: { fontSize: 12, fontWeight: "600", color: MUTED, textTransform: "uppercase" as any },

  divider: { height: 1, backgroundColor: "#333", marginHorizontal: 24, marginVertical: 8 },

  fileCard: {
    marginHorizontal: 24,
    marginVertical: 12,
    backgroundColor: CARD,
    borderRadius: 12,
    overflow: "hidden",
  },
  fileLabel: {
    color: TEXT,
    fontWeight: "600",
    fontSize: 14,
    padding: 14,
    paddingBottom: 8,
  },
  imageContainer: {
    width: "100%" as any,
    backgroundColor: "#111",
    position: "relative",
  },
  fileNotes: {
    color: MUTED,
    fontSize: 13,
    padding: 14,
    paddingTop: 8,
  },

  emptyText: { color: MUTED, textAlign: "center", marginTop: 48, fontSize: 15 },

  footer: { color: "#444", textAlign: "center", fontSize: 12, marginTop: 48 },

  revokedIcon: { fontSize: 48, marginBottom: 16 },
  revokedTitle: { fontSize: 22, fontWeight: "bold", color: TEXT, marginBottom: 8 },
  revokedSub: { fontSize: 15, color: MUTED, textAlign: "center", maxWidth: 320 },
});
