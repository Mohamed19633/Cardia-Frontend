import { ReactNode } from 'react';

interface Props {
  onClose: () => void;
  children: ReactNode;
}

export default function Backdrop({ onClose, children }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}
