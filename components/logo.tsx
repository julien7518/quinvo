import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import { ClassArray, ClassDictionary } from "clsx";

const Avenir = localFont({
  src: "../public/avenir_medium.ttf",
});

export default function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "text-3xl md:text-4xl font-black",
        Avenir.className,
        className,
      )}
    >
      <span className="text-primary">Q</span>uinvo
    </span>
  );
}
