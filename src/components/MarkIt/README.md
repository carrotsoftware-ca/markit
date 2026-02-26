# MarkIt Component

> An interactive image measurement tool built with React Native Skia, Reanimated, and Gesture Handler. Users calibrate a scale reference against a known real-world distance, then draw measurement lines directly on top of an image. All measurements are persisted in real-time to Firestore.

---

## Table of Contents

1. [Overview](#overview)
2. [How It Works — User Flow](#how-it-works--user-flow)
3. [Props](#props)
4. [Architecture](#architecture)
5. [File Structure](#file-structure)
6. [Hooks](#hooks)
   - [useZoom](#usezoom)
   - [useCalibration](#usecalibration)
   - [useCalibrationManager](#usecalibrationmanager)
   - [useMeasureLine](#usemeasureline)
   - [useMeasurementManager](#usemeasurementmanager)
   - [useTapToDelete](#usetaptodelete)
   - [useCommittedLines](#usecommittedlines)
   - [useMarkItImage](#usemarkitimage)
7. [Sub-Components](#sub-components)
   - [MeasureCanvas](#measurecanvas)
   - [CalibrationPanel](#calibrationpanel)
   - [MeasurementConfirmBar](#measurementconfirmbar)
   - [DeleteMeasurementDialog](#deletemeasurementdialog)
   - [MeasurementLine](#measurementline)
8. [Utilities](#utilities)
   - [coordTransform](#coordtransform)
   - [measureMath](#measuremath)
   - [encodeStoragePath](#encodestoragepath)
9. [Types](#types)
10. [Coordinate System](#coordinate-system)
11. [Gesture Composition](#gesture-composition)
12. [Firestore Event Model](#firestore-event-model)
13. [Platform Support](#platform-support)
14. [Key Design Decisions](#key-design-decisions)

---

## Overview

`MarkIt` lets users measure real-world distances in a photo. The workflow is:

1. **Calibrate** — the user draws a line over something in the photo whose real length is known (e.g. a door frame = 80 inches), enters the known length, and confirms.
2. **Measure** — the user draws lines over anything else in the photo and the component calculates and displays the real-world distance automatically.
3. **Persist** — all measurements are saved to Firestore in real time so multiple users can view or add to the same project.

---

## How It Works — User Flow

```
┌─────────────────────────────────────────────────┐
│                  CALIBRATE MODE                 │
│                                                 │
│  1. User draws a line over a known object       │
│  2. CalibrationPanel shows an input field       │
│  3. User types the real-world length (inches)   │
│  4. User taps "Confirm"                         │
│  5. Scale is computed and stored                │
│  6. Mode transitions to MEASURE                 │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│                  MEASURE MODE                   │
│                                                 │
│  1. User draws a line on the image              │
│  2. MeasurementConfirmBar appears with result   │
│  3. User taps "markit!" to save, or "Discard"   │
│  4. Saved lines appear permanently on the image │
│  5. User taps an existing line to delete it     │
│  6. DeleteMeasurementDialog asks for confirm    │
└─────────────────────────────────────────────────┘
```

---

## Props

| Prop        | Type     | Required | Description                                                                           |
| ----------- | -------- | -------- | ------------------------------------------------------------------------------------- |
| `imageUrl`  | `string` | No       | URL of the image to measure. Handles Firebase Storage encoded URLs.                   |
| `projectId` | `string` | No       | Firestore project ID. If omitted, measurements are local-only (not persisted).        |
| `fileId`    | `string` | No       | Firestore file ID within the project. Required alongside `projectId` for persistence. |

---

## Architecture

The component is intentionally split into layers to separate concerns and avoid performance pitfalls with Reanimated worklets:

```
index.native.tsx  (Orchestrator)
│
├── Shared Values  ──────────────────────────────────────────────────────────┐
│   (scaleAtOne, zoomLevel, translateX/Y, lineColor, isCalibrating...)       │
│   Created once at mount. Passed into all hooks. Never re-created.          │
│                                                                            │
├── Hooks (Logic Layer)                                                      │
│   ├── useZoom              → pinch, pan, double-tap gestures               │
│   ├── useCalibration       → calibrate/measure state machine               │
│   ├── useCalibrationManager → confirm handler + Firestore writes          │
│   ├── useMeasureLine       → 1-finger draw gesture + live label           │
│   ├── useMeasurementManager → pending measurement/delete state            │
│   ├── useTapToDelete       → tap gesture to select a line for deletion    │
│   ├── useCommittedLines    → derives final CommittedLine[] for rendering  │
│   └── useMarkItImage       → resolves image URI for the platform          │
│                                                                            │
└── Sub-Components (Render Layer)                                            │
    ├── MeasureCanvas         → pure Skia canvas, NO hooks                  │
    ├── CalibrationPanel      → draggable UI panel for calibration input    │
    ├── MeasurementConfirmBar → save/discard bar after drawing a line       │
    └── DeleteMeasurementDialog → confirm dialog for deleting a line       │
```

**Why are all `SharedValue`s created in `index.native.tsx`?**  
Reanimated registers worklets when `useDerivedValue` / `useAnimatedStyle` are first called. If a sub-component creates its own shared values and then re-mounts, the worklets re-register on the UI thread which causes a deadlock. Centralising all shared value creation in one component that mounts exactly once prevents this.

---

## File Structure

```
src/components/MarkIt/
│
├── index.native.tsx          # Main component (native + web via WithSkiaWeb)
├── index.web.tsx             # Web wrapper using WithSkiaWeb
├── types.ts                  # Shared TypeScript interfaces
├── README.md                 # This file
│
├── hooks/
│   ├── useCalibration.ts         # Calibrate/measure state machine
│   ├── useCalibrationManager.ts  # Confirm calibration + session restore
│   ├── useCommittedLines.ts      # Derives CommittedLine[] from Firestore + pending
│   ├── useMarkItImage.ts         # Platform-aware image URI resolution
│   ├── useMeasureLine.ts         # 1-finger draw gesture
│   ├── useMeasurementManager.ts  # Pending measurement & delete state
│   ├── useTapToDelete.ts         # Tap-to-select-line gesture
│   └── useZoom.ts                # Pinch-zoom + 2-finger pan + double-tap
│
├── components/
│   ├── CalibrationPanel.tsx       # Draggable calibration input UI
│   ├── DeleteMeasurementDialog.tsx # Delete confirmation dialog
│   ├── MeasureCanvas.tsx          # Pure Skia drawing layer
│   ├── MeasurementConfirmBar.tsx  # Save/discard bar
│   └── MeasurementLine.tsx        # Renders a single committed line + label
│
└── utils/
    ├── coordTransform.ts     # Screen ↔ normalized ↔ image-space conversions
    ├── encodeStoragePath.ts  # Firebase Storage URL encoding helper
    └── measureMath.ts        # Distance and unit formatting functions
```

---

## Hooks

### `useZoom`

**File:** `hooks/useZoom.ts`

Manages all zoom and pan state for the canvas.

**Gestures provided:**
| Gesture | Behaviour |
|---|---|
| Pinch (2 fingers) | Zooms in/out around the pinch focal point. Range: 1× – 8×. Uses a delta-based approach to prevent focal-point jolt. |
| 2-finger pan | Pans the canvas while zoomed in. |
| Double-tap | Zooms to 3× centered on the tap point. If already zoomed, resets to 1×. Uses a spring animation. |

**Returns:** `{ zoomLevel, translateX, translateY, zoomGesture, doubleTapGesture }`

All values are Reanimated `SharedValue`s so Skia can consume them on the UI thread without triggering re-renders.

---

### `useCalibration`

**File:** `hooks/useCalibration.ts`

Manages the `calibrate` → `measure` state machine.

**Responsibilities:**

- Holds `mode` (`"calibrate"` | `"measure"`) as React state.
- Holds `refInput` (the user-typed known length in inches).
- Computes `intrinsicScale` (inches per intrinsic image pixel) when calibration is confirmed.
- Exposes `confirmCalibration()` to transition to measure mode.
- Exposes `recalibrate()` to return to calibration mode and reset scale.
- Exposes `restoreFromSession()` to restore scale values when loading from Firestore.

**Zoom-aware scale storage:**  
When the user draws a calibration line at zoom level Z, the stored `scaleAtOne` is normalised to zoom 1× so that measurements are correct at any zoom level.

---

### `useCalibrationManager`

**File:** `hooks/useCalibrationManager.ts`

Bridges `useCalibration` with Firestore persistence.

**Responsibilities:**

- Provides `handleConfirmCalibration()` — the async function called when the user taps "Confirm" in the `CalibrationPanel`.
  - Clears all existing events if recalibrating.
  - Writes a `calibration_line` event to Firestore with the normalized start/end coords.
  - Writes a `calibration_confirmed` event with the computed `intrinsicScale` and `refInput`.
  - Guards against writing invalid (NaN, zero, Infinity) scale values.
- Contains the `useEffect` that restores calibration from a Firestore session on first load.

---

### `useMeasureLine`

**File:** `hooks/useMeasureLine.ts`

Manages the 1-finger draw gesture that creates a measurement line.

**Behaviour:**

- Tracks `start` and `end` as shared values (updated live on the UI thread as the finger moves).
- Computes a live `distanceText` label using `useDerivedValue` — updates every frame without touching the JS thread.
- On finger-up, calls `onLineCommitted(sx1, sy1, sx2, sy2)` on the JS thread with the final screen coordinates.
- In calibrate mode (`keepVisible = true`), the drawn line stays visible as a preview after finger-up.
- In measure mode, the line disappears after finger-up (the committed line takes over).

**Returns:** `{ drawGesture, distanceText, start, end, p1, p2, labelX, labelY, lineOpacity }`

---

### `useMeasurementManager`

**File:** `hooks/useMeasurementManager.ts`

Manages the state and handlers for creating, saving, and deleting measurements.

**State:**

- `pendingMeasurement` — a line that has been drawn but not yet saved to Firestore. It appears on screen immediately while the user decides to save or discard.
- `pendingDelete` — a committed line that has been tapped and is awaiting delete confirmation.

**Handlers:**
| Handler | Description |
|---|---|
| `handleLineCommitted(sx1, sy1, sx2, sy2)` | Called when a line is drawn. Converts screen coords to image space and creates a `pendingMeasurement`. |
| `handleSaveMeasurement()` | Writes the pending measurement to Firestore as a `measurement` event. |
| `handleDiscardMeasurement()` | Clears the pending measurement without saving. |
| `handleDeleteMeasurement(id)` | Writes a `delete` event to Firestore referencing the target measurement's ID. |

> **Note:** `dimensionsRef` (a `RefObject`) is passed in rather than `dimensions` (a plain object) to ensure the handler always reads the **latest** layout dimensions and never operates on a stale snapshot.

---

### `useTapToDelete`

**File:** `hooks/useTapToDelete.ts`

Provides the `tapToDeleteGesture` — a single-tap recogniser that detects when the user taps close to an existing committed line.

**Hit detection algorithm:**

1. Converts the tap's screen coordinates to image-space coordinates (zoom-corrected).
2. For each committed line, computes the shortest distance from the tap point to the line segment using a parametric closest-point calculation.
3. If the closest line is within a threshold of 24 screen pixels (scaled by zoom), it is selected.
4. Sets `pendingDelete` with the matched line's ID and label.

All gesture-related values are read via `RefObject`s to prevent stale closure bugs.

---

### `useCommittedLines`

**File:** `hooks/useCommittedLines.ts`

Derives the final `CommittedLine[]` array to be rendered on the canvas each frame.

**Process:**

1. Takes `session.measurements` (raw Firestore events) and converts each from normalized coordinates to image-space pixels using `normalizedToImageSpace`.
2. Filters out any measurements with invalid labels (`NaN`, `Infinity`).
3. Appends the `pendingMeasurement` line (if one exists) so it appears on screen immediately after drawing, before Firestore has confirmed the save.

---

### `useMarkItImage`

**File:** `hooks/useMarkItImage.ts`

Resolves the image URL into a local URI appropriate for the current platform.

- Handles Firebase Storage URL encoding differences.
- Abstracts platform-specific asset resolution so `index.native.tsx` always receives a usable `localUri`.

---

## Sub-Components

### `MeasureCanvas`

**File:** `components/MeasureCanvas.tsx`

The pure Skia drawing layer. **Contains zero hooks** (except `useFont` which is safe).

**Why no hooks?**  
All animated/derived values are created in `index.native.tsx` and passed as props. This guarantees that no Reanimated worklet is ever registered inside this component, eliminating the risk of a UI-thread deadlock on re-render.

**Renders:**

- The source image (with zoom/pan transform applied via a Skia `Group`).
- The live in-progress measurement line and label pill (visible while finger is down).
- All committed `MeasurementLine` components inside the zoom `Group` so they scale and pan with the image.
- The optional calibration reference line (toggled from the `CalibrationPanel`).

---

### `CalibrationPanel`

**File:** `components/CalibrationPanel.tsx`

A draggable, floating UI panel that appears during both calibrate and measure modes.

**In calibrate mode:**

- Shows a text input for the user to type the known reference length.
- Shows a "Confirm" button that triggers `handleConfirmCalibration`.

**In measure mode:**

- Shows the current scale (e.g. "1.0 in/px").
- Shows a "Recalibrate" button.
- Shows a toggle to show/hide the calibration reference line on the canvas.

**Draggable:**  
The panel can be dragged anywhere on screen. It also auto-nudges upward when the keyboard appears to avoid being obscured.

---

### `MeasurementConfirmBar`

**File:** `components/MeasurementConfirmBar.tsx`

A bottom bar that appears after the user draws a measurement line.

**Shows:**

- The computed distance label (e.g. `"2ft 4.5in"`).
- A **"Discard"** button — clears the pending measurement.
- A **"markit!"** save button — saves the measurement to Firestore.

---

### `DeleteMeasurementDialog`

**File:** `components/DeleteMeasurementDialog.tsx`

A confirmation dialog that appears when the user taps a committed measurement line.

**Shows:**

- The measurement label of the tapped line.
- A **"Keep"** button — cancels the deletion.
- A **"Delete"** button — writes a `delete` event to Firestore.

---

### `MeasurementLine`

**File:** `components/MeasurementLine.tsx`

Renders a single committed measurement line and its label pill inside the Skia canvas.

- Rendered inside the zoom `Group` in `MeasureCanvas` so it automatically scales and pans with the image.
- Coordinates are in image-space pixels (zoom=1, pan=0).

---

## Utilities

### `coordTransform`

**File:** `utils/coordTransform.ts`

Provides functions for converting between the three coordinate spaces used by the component.

| Function                                                                      | Description                                                                                                                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `screenToNormalized(screenX, screenY, image, canvasW, canvasH, zoom, tx, ty)` | Converts a gesture screen coordinate to a normalized [0,1] image coordinate, accounting for current zoom and pan.                                |
| `normalizedToImageSpace(point, image, canvasW, canvasH)`                      | Converts a stored normalized coordinate to image-space pixels at zoom=1 / pan=0. Used when rendering committed lines inside the Skia zoom Group. |

---

### `measureMath`

**File:** `utils/measureMath.ts`

Math utilities for computing and formatting real-world distances.

| Function                                            | Description                                                                                                                                           |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `screenPxToInches(screenPx, scaleAtOne, zoomLevel)` | Converts a screen pixel distance to real-world inches. Corrects for zoom level. Marked as `worklet` — safe to call from Reanimated `useDerivedValue`. |
| `formatInches(inches)`                              | Formats a decimal inch value into a human-readable string. e.g. `14.5` → `"1ft 2.5in"`, `3.0` → `"3.0in"`. Marked as `worklet`.                       |
| `pixelDistance(x1, y1, x2, y2)`                     | Returns the Euclidean distance between two points in pixels.                                                                                          |

---

### `encodeStoragePath`

**File:** `utils/encodeStoragePath.ts`

Handles encoding of Firebase Storage URLs. Firebase Storage paths may contain characters that need to be percent-encoded for use as a download URL. This utility normalises those paths.

---

## Types

**File:** `types.ts`

Central type definitions shared across the component and its hooks.

| Type                    | Description                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `MarkitMode`            | `"calibrate"` \| `"measure"` — the current operating mode.                                                                               |
| `CommittedLine`         | A measurement line saved to Firestore or pending save. Contains `id`, `x1`, `y1`, `x2`, `y2` (image-space pixels), and `label`.          |
| `PendingMeasurement`    | A drawn line awaiting user confirmation. Contains the `CommittedLine` data plus `normStart`/`normEnd` (normalized coords for Firestore). |
| `PendingDelete`         | A committed line that has been tapped and is awaiting delete confirmation. Contains `id` and `distanceText`.                             |
| `CalibrationScreenLine` | A calibration reference line for display purposes. Contains `x1`, `y1`, `x2`, `y2` in image-space pixels.                                |

---

## Coordinate System

The component uses **three distinct coordinate spaces**. Understanding these is critical when reading or modifying any measurement logic.

```
┌─────────────────────────────────────────────────────────┐
│  1. SCREEN SPACE                                        │
│                                                         │
│  Origin: top-left of the canvas view.                   │
│  Unit: logical points (CSS pixels).                     │
│  Source: gesture event coordinates (e.x, e.y).          │
│  Affected by: zoom + pan.                               │
└─────────────────────────────────────────────────────────┘
                        │
            screenToNormalized()
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  2. NORMALIZED SPACE                                    │
│                                                         │
│  Range: [0.0, 1.0] relative to the image bounds.        │
│  Independent of: screen size, zoom, pan, pixel density. │
│  Used for: storing coordinates in Firestore.            │
│  This is what gets persisted.                           │
└─────────────────────────────────────────────────────────┘
                        │
           normalizedToImageSpace()
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  3. IMAGE SPACE                                         │
│                                                         │
│  Unit: canvas pixels at zoom=1, pan=0.                  │
│  Used for: rendering committed lines inside the         │
│            Skia zoom Group. Lines automatically          │
│            scale and pan with the image.                │
└─────────────────────────────────────────────────────────┘
```

> **Why normalize for Firestore?**  
> Storing normalized coordinates means the same measurement looks correct regardless of the screen size or pixel density of the device viewing it. A measurement drawn on an iPhone 15 renders correctly when viewed on a tablet or on the web.

---

## Gesture Composition

All gestures are composed in `index.native.tsx` using React Native Gesture Handler's declarative API:

```
Gesture.Simultaneous(
  zoomGesture,                    ← always runs in parallel with everything
  Gesture.Exclusive(
    doubleTapGesture,             ← wins over draw if 2 taps land fast
    tapToDeleteGesture,           ← wins over draw if it's a short tap
    drawGesture                   ← fallback: long press/drag = draw a line
  )
)
```

**Why `Exclusive` for tap/draw?**  
`drawGesture` is a `Pan` gesture with `minDistance(0)`. Without `Exclusive`, a single short tap would also trigger a draw. `Exclusive` ensures `tapToDeleteGesture` and `doubleTapGesture` both get priority, while `drawGesture` only activates when neither tap recogniser fires.

---

## Firestore Event Model

Measurements are stored as an **append-only event log** rather than a mutable document. This allows multiple users to write simultaneously without conflicts, and supports undo/redo in the future.

| Event Type              | Fields                                                 | Description                                                                            |
| ----------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `calibration_line`      | `id`, `start`, `end`                                   | Normalized coordinates of the calibration reference line.                              |
| `calibration_confirmed` | `intrinsicScale`, `refInput`, `calibrationLineEventId` | The computed scale and the user-entered reference length.                              |
| `measurement`           | `start`, `end`, `distanceText`                         | A saved measurement line in normalized coordinates.                                    |
| `delete`                | `targetEventId`                                        | Soft-deletes a previous event. The event log is replayed to compute the current state. |

The `useMarkitSession` hook (in `src/hooks/`) subscribes to this event log via a Firestore real-time listener and exposes the derived state: `activeCalibration`, `activeCalibrationLine`, and `measurements`.

---

## Platform Support

| Platform      | Implementation                                                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| iOS / Android | `index.native.tsx` — full feature set using React Native Skia and Gesture Handler.                                                                                                        |
| Web           | `index.web.tsx` — wraps `index.native.tsx` using `WithSkiaWeb` from `@shopify/react-native-skia`. Loads the `canvaskit.wasm` engine asynchronously, shows a loading fallback until ready. |

---

## Key Design Decisions

### 1. All `SharedValue`s are created in `index.native.tsx`

Reanimated registers C++ worklets the first time a `useDerivedValue` or `useAnimatedStyle` is encountered. If a component containing such hooks re-mounts (e.g. during navigation), those worklets attempt to re-register on the UI thread, causing a deadlock. By creating all shared values and derived values at the top level of `MarkIt` — which mounts exactly once — this deadlock is completely prevented.

### 2. `MeasureCanvas` has zero hooks

`MeasureCanvas` is a pure rendering component. All animated values are passed as props. This means it can never cause a worklet re-registration, no matter how many times it re-renders.

### 3. Refs over state for gesture callbacks

Gesture callbacks run synchronously on the JS thread. If they close over React state, they see stale values from the render in which they were created. All values read inside gesture callbacks (mode, committedLines, pendingMeasurement, etc.) are stored in `RefObject`s and updated on every render via direct `.current` assignment, ensuring the callback always sees the latest value.

### 4. `dimensionsRef` instead of `dimensions`

Passing `dimensionsRef` (the ref object) rather than `dimensionsRef.current` (a value snapshot) into hooks ensures that async handlers like `handleLineCommitted` always read the latest canvas dimensions at the time they execute, not the dimensions from the render that created them.

### 5. Pending measurement for instant feedback

When the user draws a line, a `PendingMeasurement` is created immediately and displayed on the canvas. The Firestore write happens asynchronously. This means there is **zero perceived latency** between drawing a line and seeing it on screen, even on a slow connection.

### 6. Append-only event log

Measurements are never mutated in Firestore. Every action (add, delete) is a new event appended to the log. The current state is derived by replaying the log. This makes concurrent multi-user editing conflict-free and sets up a foundation for undo/redo.
