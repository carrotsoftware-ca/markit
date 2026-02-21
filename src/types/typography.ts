export const FontFamilies = {
  light: "SpaceGrotesk-Light",
  regular: "SpaceGrotesk-Regular",
  medium: "SpaceGrotesk-Medium",
  semiBold: "SpaceGrotesk-SemiBold",
  bold: "SpaceGrotesk-Bold",
} as const;

export type FontFamily = (typeof FontFamilies)[keyof typeof FontFamilies];
