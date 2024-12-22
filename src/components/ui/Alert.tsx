// src/components/ui/Alert.tsx
import React from "react";

export interface AlertProps {
  message: string;
  variant?: "success" | "error" | "info" | "warning";
}

const Alert: React.FC<AlertProps> = ({ message, variant = "info" }) => {
  const colors = {
    success: "bg-green-100 text-green-700 border-green-300",
    error: "bg-red-100 text-red-700 border-red-300",
    info: "bg-blue-100 text-blue-700 border-blue-300",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-300",
  };

  return (
    <div className={`border-l-4 p-4 ${colors[variant]}`}>
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default Alert;
