import React, { useState } from "react";
import { useField } from "formik";
import { Box, Typography } from "@mui/material";

interface ToothSelectorProps {
  name: string;
  onSelect: (toothId: number) => void;
  selectedTeeth?: number[];
}

interface ToothData {
  id: number;
  position: { x: number; y: number };
  quadrant: 'upper' | 'lower';
}

// Define tooth positions based on dental chart layout
const teethData: ToothData[] = [
  // Upper teeth (right to left from patient's perspective)
  { id: 18, position: { x: 50, y: 80 }, quadrant: 'upper' },
  { id: 17, position: { x: 80, y: 75 }, quadrant: 'upper' },
  { id: 16, position: { x: 110, y: 70 }, quadrant: 'upper' },
  { id: 15, position: { x: 140, y: 65 }, quadrant: 'upper' },
  { id: 14, position: { x: 170, y: 60 }, quadrant: 'upper' },
  { id: 13, position: { x: 200, y: 55 }, quadrant: 'upper' },
  { id: 12, position: { x: 230, y: 50 }, quadrant: 'upper' },
  { id: 11, position: { x: 260, y: 45 }, quadrant: 'upper' },
  
  { id: 21, position: { x: 290, y: 45 }, quadrant: 'upper' },
  { id: 22, position: { x: 320, y: 50 }, quadrant: 'upper' },
  { id: 23, position: { x: 350, y: 55 }, quadrant: 'upper' },
  { id: 24, position: { x: 380, y: 60 }, quadrant: 'upper' },
  { id: 25, position: { x: 410, y: 65 }, quadrant: 'upper' },
  { id: 26, position: { x: 440, y: 70 }, quadrant: 'upper' },
  { id: 27, position: { x: 470, y: 75 }, quadrant: 'upper' },
  { id: 28, position: { x: 500, y: 80 }, quadrant: 'upper' },

  // Lower teeth (right to left from patient's perspective)
  { id: 48, position: { x: 50, y: 320 }, quadrant: 'lower' },
  { id: 47, position: { x: 80, y: 315 }, quadrant: 'lower' },
  { id: 46, position: { x: 110, y: 310 }, quadrant: 'lower' },
  { id: 45, position: { x: 140, y: 305 }, quadrant: 'lower' },
  { id: 44, position: { x: 170, y: 300 }, quadrant: 'lower' },
  { id: 43, position: { x: 200, y: 295 }, quadrant: 'lower' },
  { id: 42, position: { x: 230, y: 290 }, quadrant: 'lower' },
  { id: 41, position: { x: 260, y: 285 }, quadrant: 'lower' },
  
  { id: 31, position: { x: 290, y: 285 }, quadrant: 'lower' },
  { id: 32, position: { x: 320, y: 290 }, quadrant: 'lower' },
  { id: 33, position: { x: 350, y: 295 }, quadrant: 'lower' },
  { id: 34, position: { x: 380, y: 300 }, quadrant: 'lower' },
  { id: 35, position: { x: 410, y: 305 }, quadrant: 'lower' },
  { id: 36, position: { x: 440, y: 310 }, quadrant: 'lower' },
  { id: 37, position: { x: 470, y: 315 }, quadrant: 'lower' },
  { id: 38, position: { x: 500, y: 320 }, quadrant: 'lower' },
];

const ToothSelector: React.FC<ToothSelectorProps> = ({ name, onSelect, selectedTeeth = [] }) => {
  const [field, , helpers] = useField(name);
  const { value } = field;
  const { setValue } = helpers;
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);

  const handleToothClick = (toothId: number) => {
    setValue(toothId);
    onSelect(toothId);
  };

  const isSelected = (toothId: number) => {
    return selectedTeeth.includes(toothId) || value === toothId;
  };

  const ToothComponent: React.FC<{ tooth: ToothData }> = ({ tooth }) => {
    const selected = isSelected(tooth.id);
    const hovered = hoveredTooth === tooth.id;
    
    return (
      <g key={tooth.id}>
        <circle
          cx={tooth.position.x}
          cy={tooth.position.y}
          r="15"
          fill={selected ? "#AB09B5" : hovered ? "#f0f0f0" : "white"}
          stroke={selected ? "#AB09B5" : "#ccc"}
          strokeWidth="2"
          style={{ cursor: "pointer" }}
          onClick={() => handleToothClick(tooth.id)}
          onMouseEnter={() => setHoveredTooth(tooth.id)}
          onMouseLeave={() => setHoveredTooth(null)}
        />
        <text
          x={tooth.position.x}
          y={tooth.position.y + 4}
          textAnchor="middle"
          fontSize="10"
          fill={selected ? "white" : "#333"}
          style={{ cursor: "pointer", userSelect: "none" }}
          onClick={() => handleToothClick(tooth.id)}
          onMouseEnter={() => setHoveredTooth(tooth.id)}
          onMouseLeave={() => setHoveredTooth(null)}
        >
          {tooth.id}
        </text>
      </g>
    );
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
      <svg width="550" height="400" viewBox="0 0 550 400">
        {/* Upper jaw outline */}
        <path
          d="M 50 100 Q 275 30 500 100"
          stroke="#ccc"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Lower jaw outline */}
        <path
          d="M 50 300 Q 275 370 500 300"
          stroke="#ccc"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Render all teeth */}
        {teethData.map(tooth => (
          <ToothComponent key={tooth.id} tooth={tooth} />
        ))}
        
        {/* Legend */}
        <text x="275" y="20" textAnchor="middle" fontSize="14" fill="#666">
          Zahnschema
        </text>
        
        {/* Quadrant labels */}
        <text x="100" y="40" textAnchor="middle" fontSize="12" fill="#999">
          Oberkiefer
        </text>
        <text x="100" y="390" textAnchor="middle" fontSize="12" fill="#999">
          Unterkiefer
        </text>
      </svg>
      
      {hoveredTooth && (
        <Typography 
          variant="caption" 
          sx={{ 
            display: "block", 
            textAlign: "center", 
            mt: 1, 
            color: "#666" 
          }}
        >
          Zahn {hoveredTooth}
        </Typography>
      )}
    </Box>
  );
};

export default ToothSelector;
