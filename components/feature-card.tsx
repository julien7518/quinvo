"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  colSpan?: number;
  rowSpan?: number;
  className?: string;
  children?: ReactNode;
}

export function FeatureCard({
  title,
  description,
  colSpan,
  rowSpan,
  className,
  children,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        `relative rounded-2xl border bg-background overflow-hidden min-h-[180px] md:min-h-[210px] md:col-span-${colSpan ?? 1} md:row-span-${rowSpan ?? 1}`,
        className,
      )}
    >
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-bl from-primary/20 via-transparent to-transparent" />
      <div
        className={cn(
          "relative z-10 h-full flex p-6 md:p-0",
          children ? "md:pt-8 md:pl-8" : "md:p-8",
        )}
      >
        <div className="flex-col">
          <h3 className="font-semibold mb-2 text-xl">{title}</h3>
          <p className="text-sm text-muted-foreground flex-1">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
