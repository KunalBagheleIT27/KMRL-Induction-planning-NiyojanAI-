import React from 'react';

export function UploadIcon({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 3v10" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 7l4-4 4 4" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="13" width="18" height="8" rx="2" stroke="#333" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
