import React from 'react';

interface NexInternLogoProps {
  className?: string;
}

export const NexInternLogo: React.FC<NexInternLogoProps> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shape 1: Top-Left Navy Blue */}
      <polygon points="12.0,19.3 36.0,36.1 36.0,65.1 12.0,48.3" fill="#0d2b56" />
      {/* Shape 2: Bottom-Left Navy Blue */}
      <polygon points="12.0,85.5 36.0,102.3 36.0,126.3 12.0,109.5" fill="#0d2b56" />
      {/* Shape 3: Center Diagonal Navy Blue */}
      <polygon points="36.0,68.7 60.0,85.5 60.0,115.5 36.0,98.7" fill="#0d2b56" />
      {/* Shape 4: Top-Right Crimson Red */}
      <polygon points="63.0,18.0 87.0,34.8 87.0,88.8 63.0,72.0" fill="#c5222f" />
      {/* Shape 5: Bottom-Right Crimson Red */}
      <polygon points="63.0,75.6 87.0,92.4 87.0,122.4 63.0,105.6" fill="#c5222f" />
    </svg>
  );
};
