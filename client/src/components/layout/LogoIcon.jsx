import React from 'react';

export default function LogoIcon({ className = 'w-10 h-10' }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`${className} select-none transition-transform duration-300 hover:scale-105`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      
      {/* Outer loop representing the circular economy */}
      <path 
        d="M32 50C32 60 40 68 50 68C60 68 68 60 68 50C68 40 60 32 50 32" 
        stroke="url(#logo-grad)" 
        strokeWidth="7" 
        strokeLinecap="round" 
      />
      <path 
        d="M50 68C40 68 32 60 32 50C32 40 40 32 50 32C60 32 68 40 68 50" 
        stroke="#d1fae5" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeDasharray="5 7" 
      />
      
      {/* Styling leaf pointing upward representing organic recycling growth */}
      <path 
        d="M50 16C50 16 63 29 63 40C63 49 56 55 50 55C44 55 37 49 37 40C37 29 50 16 50 16Z" 
        fill="url(#logo-grad)" 
      />
      <path 
        d="M50 25V47" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      <path 
        d="M50 31C52.5 32 55 31 55 31" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
      />
      <path 
        d="M50 37C47.5 38 45 37 45 37" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
      />
    </svg>
  );
}
