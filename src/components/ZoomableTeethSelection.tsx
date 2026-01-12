import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useRef, useState, useCallback, TouchEvent } from "react";
import TeethSelection from "./TeethSelection";

interface ZoomableTeethSelectionProps {
  selectedTeeth?: number[];
  selectedConnectors?: Array<[number, number]>;
  selectedOperation?: any;
  teethColorMap?: Record<number, string>;
  connectorsColorMap?: Record<string, string>;
  handleSelectTooth?: (selection: number) => void;
  handleSelectConnector?: (selection: number[]) => void;
  readOnly?: boolean;
}

/**
 * A wrapper component that makes TeethSelection scrollable and zoomable on mobile devices.
 * On desktop, it renders TeethSelection normally.
 * On mobile (<600px), it provides:
 * - Horizontal/vertical scrolling
 * - Pinch-to-zoom support for detailed tooth selection
 * - Double-tap to reset zoom
 */
const ZoomableTeethSelection: React.FC<ZoomableTeethSelectionProps> = (
  props,
) => {
  const {
    selectedTeeth,
    selectedConnectors,
    selectedOperation,
    teethColorMap,
    connectorsColorMap,
    handleSelectTooth,
    handleSelectConnector,
    readOnly = true,
  } = props;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);

  // Calculate distance between two touch points
  const getDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle touch start for pinch-to-zoom
  const handleTouchStart = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 2) {
        const distance = getDistance(e.touches);
        setInitialDistance(distance);
        setInitialScale(scale);
      }
    },
    [scale],
  );

  // Handle touch move for pinch-to-zoom
  const handleTouchMove = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (e.touches.length === 2 && initialDistance !== null) {
        const currentDistance = getDistance(e.touches);
        const scaleChange = currentDistance / initialDistance;
        const newScale = Math.min(Math.max(initialScale * scaleChange, 0.5), 3);
        setScale(newScale);
      }
    },
    [initialDistance, initialScale],
  );

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    setInitialDistance(null);
  }, []);

  // Reset zoom on double tap
  const lastTapRef = useRef<number>(0);
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setScale(1);
    }
    lastTapRef.current = now;
  }, []);

  // On desktop, render TeethSelection normally
  if (!isMobile) {
    return (
      <TeethSelection
        selectedTeeth={selectedTeeth}
        selectedConnectors={selectedConnectors}
        selectedOperation={selectedOperation}
        teethColorMap={teethColorMap}
        connectorsColorMap={connectorsColorMap}
        handleSelectTooth={handleSelectTooth}
        handleSelectConnector={handleSelectConnector}
        readOnly={readOnly}
      />
    );
  }

  // On mobile, wrap with scrollable/zoomable container
  return (
    <Box
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleDoubleTap}
      sx={{
        width: "100%",
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-x pan-y pinch-zoom",
        position: "relative",
        maxHeight: "60vh",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        backgroundColor: "rgba(248, 250, 252, 1)",
        // Visual hint that content is scrollable/zoomable
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "20px",
          background:
            "linear-gradient(to top, rgba(248, 250, 252, 0.9), transparent)",
          pointerEvents: "none",
        },
      }}
    >
      <Box
        sx={{
          transform: `scale(${scale})`,
          transformOrigin: "center top",
          transition: initialDistance ? "none" : "transform 0.2s ease-out",
          minWidth: scale > 1 ? `${100 * scale}%` : "100%",
          display: "flex",
          justifyContent: "center",
          padding: 2,
        }}
      >
        <TeethSelection
          selectedTeeth={selectedTeeth}
          selectedConnectors={selectedConnectors}
          selectedOperation={selectedOperation}
          teethColorMap={teethColorMap}
          connectorsColorMap={connectorsColorMap}
          handleSelectTooth={handleSelectTooth}
          handleSelectConnector={handleSelectConnector}
          readOnly={readOnly}
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
      </Box>
    </Box>
  );
};

export default ZoomableTeethSelection;
