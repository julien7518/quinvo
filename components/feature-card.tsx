"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  large?: boolean;
  className?: string;
  children?: ReactNode;
}

export function FeatureCard({
  title,
  description,
  large,
  className,
  children,
}: FeatureCardProps) {
  const [isMdUp, setIsMdUp] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = () => setIsMdUp(mediaQuery.matches);

    handleChange();

    mediaQuery.addEventListener("change", handleChange, { passive: true });
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-background overflow-hidden min-h-[180px] md:min-h-[210px]",
        className,
        large ? "md:col-span-2 md:row-span-1" : "md:col-span-1 md:row-span-1",
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
        {isMdUp && children}
      </div>
    </div>
  );
}
