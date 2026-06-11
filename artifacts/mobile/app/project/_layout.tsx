import { Stack } from "expo-router";
import React from "react";

import { useColors } from "@/hooks/useColors";

export default function ProjectLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
        headerBackTitle: "Back",
      }}
    />
  );
}
