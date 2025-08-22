"use client";

import { PanelResizeHandle } from "react-resizable-panels";
import { cn } from "@/lib/utils"; // shadcn helper
import { GripHorizontal, GripVertical } from "lucide-react";

export default function CustomResizeHandle({
  direction,
}: {
  direction: "horizontal" | "vertical";
}) {
  const isVertical = direction === "vertical";

  return (
    <PanelResizeHandle
      className={cn(
        "group relative flex items-center justify-center",
        "transition-all duration-300 ease-in-out",
        isVertical ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize",
        "bg-transparent",
        "hover:bg-orange-500/80 data-[resize-handle-state=drag]:bg-orange-500/80",
        isVertical
          ? "data-[resize-handle-state=drag]:w-2"
          : "data-[resize-handle-state=drag]:h-2"
      )}
    >
    </PanelResizeHandle>
  );
}
