// src/components/ui/Card.tsx
import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "border rounded-lg shadow-sm bg-white p-4 dark:bg-gray-800 dark:border-gray-700",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn("mb-4 font-medium text-lg", className)} {...props}>
      {children}
    </div>
  );
};

export const CardBody: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn("text-sm text-gray-600 dark:text-gray-400", className)} {...props}>
      {children}
    </div>
  );
};

Card.displayName = "Card";

export default Card;
