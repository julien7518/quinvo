import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export function StateSelector() {
  const [activeTab, setActiveTab] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    height: 0,
  });
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);

  interface TabInterface {
    label: string;
    variant: "outline" | "default" | "secondary" | "destructive";
  }

  const tabs: TabInterface[] = [
    { label: "Draft", variant: "outline" },
    { label: "Sent", variant: "default" },
    { label: "Paid", variant: "secondary" },
    { label: "Overdue", variant: "destructive" },
  ];

  useEffect(() => {
    updateIndicator(activeTab);
  }, [activeTab]);

  const updateIndicator = (index: number) => {
    const wrapper = badgeRefs.current[index];
    if (wrapper) {
      const badge = wrapper.firstElementChild as HTMLElement;
      if (badge) {
        setIndicatorStyle({
          left: wrapper.offsetLeft,
          width: badge.offsetWidth,
          height: badge.offsetHeight,
        });
      }
    }
  };

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div className="justify-around flex">
      <div className="relative inline-flex gap-2 p-1 rounded-lg bg-muted">
        <div
          className="absolute rounded-md transition-all bg-background duration-300 ease-in-out shadow-sm"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            height: `${indicatorStyle.height}px`,
            top: "6.75px",
          }}
        />
        {tabs.map((tab, index) => (
          <div
            key={index}
            ref={(el: HTMLDivElement | null) => {
              badgeRefs.current[index] = el;
            }}
          >
            <Badge
              variant={activeTab === index ? tab.variant : "outline"}
              className={
                "relative z-10 cursor-pointer transition-colors duration-200 border-0"
              }
              onClick={() => handleTabClick(index)}
            >
              {tab.label}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
