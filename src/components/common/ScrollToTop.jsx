import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// A route change in a single-page app swaps components inside the *same*
// document, so the browser keeps the window's current scroll offset (and
// restores the old one when you go back/forward). Every page therefore opens
// wherever you last stopped reading. This resets the scroll on navigation.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  // Let this component own scroll position. With the default "auto" mode the
  // browser restores the old offset *after* React renders the new page, which
  // overrides the reset below (most visible when navigating back).
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
