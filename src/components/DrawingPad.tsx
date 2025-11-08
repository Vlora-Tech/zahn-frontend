import { Button, Stack } from "@mui/material";
import React from "react";

export const DrawingPad: React.FC<{
  value?: string;
  onChange: (dataUrl: string) => void;
  width?: number;
  height?: number;
  strokeWidth?: number;
}> = ({ value, onChange, width = 320, height = 160, strokeWidth = 2 }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const dprRef = React.useRef<number>(1);

  // Setup canvas for HiDPI and restore existing image (value)
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    dprRef.current = dpr;

    // Set intrinsic pixel size
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    // Set CSS size (what you see)
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const c = canvas.getContext("2d");
    if (!c) return;

    // Scale so drawing API uses CSS pixels
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.lineJoin = "round";
    c.lineCap = "round";
    c.lineWidth = strokeWidth;

    // Clear + draw existing image if provided
    c.clearRect(0, 0, width, height);
    if (value) {
      const img = new Image();
      img.onload = () => {
        c.clearRect(0, 0, width, height);
        c.drawImage(img, 0, 0, width, height);
      };
      img.src = value;
    }

    setCtx(c);
  }, [width, height, strokeWidth]); // re-init on geometry/line changes

  // When external value changes (e.g., reset), redraw it
  React.useEffect(() => {
    if (!ctx) return;
    if (!value) {
      ctx.clearRect(0, 0, width, height);
      return;
    }
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = value;
  }, [value, ctx, width, height]);

  // coords in CSS pixels
  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!ctx) return;
    e.preventDefault();
    setIsDrawing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const finishStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!ctx || !canvasRef.current) return;
    setIsDrawing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      console.log("error in finishStroke")
    }
    onChange(canvasRef.current.toDataURL("image/png"));
  };

  const handleClear = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, width, height);
    onChange("");
  };

  return (
    <Stack gap={1}>
      <canvas
        ref={canvasRef}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={finishStroke}
        onPointerLeave={finishStroke}
        style={{
          border: "1px solid rgba(0,0,0,0.2)",
          borderRadius: 8,
          display: "block",
          touchAction: "none", // prevents scroll on touch while drawing
        }}
      />
      <Button variant="outlined" onClick={handleClear}>
        Clear
      </Button>
    </Stack>
  );
};
