"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track, type EventName } from "@/lib/analytics/events";

type Props = ComponentProps<typeof Link> & { event: EventName; eventParams?: Record<string, string | number> };

export function TrackedLink({ event, eventParams, onClick, ...rest }: Props) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        track(event, eventParams);
        onClick?.(e);
      }}
    />
  );
}
