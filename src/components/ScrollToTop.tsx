import { useEffect } from "react";
import { useLocation } from "wouter";

export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [location]);

  return null;
}
