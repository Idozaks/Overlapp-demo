import React from 'react'

export type IconProps = React.HTMLAttributes<SVGElement>

const Icons = {
  logo: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#overlapp-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <defs>
        <linearGradient id="overlapp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4D7FE8" />
          <stop offset="100%" stopColor="#40E0D0" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l2 2 4-4" />
    </svg>
  ),
}

export { Icons }