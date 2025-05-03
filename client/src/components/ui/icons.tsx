import React from 'react'

export type IconProps = React.HTMLAttributes<SVGElement>

const createGradientId = (name: string) => `${name}-gradient-${Math.random().toString(36).substring(2, 10)}`;

const Icons = {
  logo: (props: IconProps) => {
    const gradientId = createGradientId('overlapp');
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4D7FE8" />
            <stop offset="100%" stopColor="#40E0D0" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l2 2 4-4" />
      </svg>
    );
  },
  
  sparkle: (props: IconProps) => {
    const gradientId = createGradientId('sparkle');
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4D7FE8" />
            <stop offset="100%" stopColor="#40E0D0" />
          </linearGradient>
        </defs>
        <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
      </svg>
    );
  },
  
  connect: (props: IconProps) => {
    const gradientId = createGradientId('connect');
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4D7FE8" />
            <stop offset="100%" stopColor="#40E0D0" />
          </linearGradient>
        </defs>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    );
  }
}

export { Icons }