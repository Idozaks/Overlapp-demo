
interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-8 w-8" }: LogoProps) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="8" fill="url(#paint0_linear)" />
      <path 
        d="M20 10C14.477 10 10 14.477 10 20C10 25.523 14.477 30 20 30C25.523 30 30 25.523 30 20C30 14.477 25.523 10 20 10ZM20 15C22.761 15 25 17.239 25 20C25 22.761 22.761 25 20 25C17.239 25 15 22.761 15 20C15 17.239 17.239 15 20 15Z" 
        fill="white" 
      />
      <defs>
        <linearGradient id="paint0_linear" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4D7FE8" />
          <stop offset="1" stopColor="#7A5AF8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
