// src/components/ui/Dialog.tsx
import React, { useState } from "react";

export interface DialogProps {
  title: string;
  description?: string;
  triggerText: string;
  onConfirm?: () => void;
}

const Dialog: React.FC<DialogProps> = ({ title, description, triggerText, onConfirm }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        onClick={() => setIsOpen(true)}
      >
        {triggerText}
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-medium">{title}</h2>
            {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={() => {
                  onConfirm && onConfirm();
                  setIsOpen(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dialog;
