"use client";

import { useEffect, useState } from "react";
import { MoonStar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const savedTheme = window.localStorage.getItem("mastery-theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    window.localStorage.setItem("mastery-theme", isDark ? "dark" : "light");
  }, [isDark]);

  function toggleTheme() {
    setIsDark((current) => !current);
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full border-border/70 bg-background/70 backdrop-blur"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <MoonStar className="size-4" />
    </Button>
  );
}
