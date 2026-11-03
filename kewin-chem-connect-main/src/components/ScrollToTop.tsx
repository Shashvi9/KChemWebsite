import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0); // Scrolls to the top
  }, [pathname, hash]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;
