// src/components/ui/Label.tsx
import React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label: React.FC<LabelProps> = ({ className, children, ...props }) => {
  return (
    <label className={cn("block text-sm font-medium text-gray-700", className)} {...props}>
      {children}
    </label>
  );
};

export default Label;
