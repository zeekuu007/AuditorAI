import React from "react";
import { Search, BarChart3 } from "lucide-react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true, size = "md" }) => {
  const sizeClasses = {
    sm: { icon: "w-6 h-6", text: "text-lg", tagline: "text-[6px]" },
    md: { icon: "w-10 h-10", text: "text-2xl", tagline: "text-[8px]" },
    lg: { icon: "w-16 h-16", text: "text-4xl", tagline: "text-[10px]" },
    xl: { icon: "w-32 h-32", text: "text-6xl", tagline: "text-[14px]" },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* The Magnifying Glass Circle */}
        <div className={`${currentSize.icon} rounded-full border-4 border-violet-600 flex items-center justify-center bg-transparent relative overflow-visible`}>
          {/* The Bar Chart inside */}
          <div className="flex items-end gap-0.5 h-1/2 mb-1">
            <div className="w-1 h-3 bg-teal-400 rounded-t-sm animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-5 bg-teal-400 rounded-t-sm animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="w-1 h-7 bg-teal-400 rounded-t-sm animate-pulse" style={{ animationDelay: '400ms' }} />
            <div className="w-1 h-4 bg-teal-400 rounded-t-sm animate-pulse" style={{ animationDelay: '600ms' }} />
          </div>
          
          {/* The "A" integrated into the handle - we'll simulate the look with a rotated div or icon */}
          <div className="absolute -bottom-1 -right-1 w-1/2 h-1/2 flex items-center justify-center">
             <div className="w-6 h-1.5 bg-violet-600 rounded-full rotate-45 transform origin-top-left" />
          </div>
        </div>
      </div>
      
      {showText && (
        <div className="mt-3 text-center">
          <div className={`font-bold ${currentSize.text} tracking-tight leading-none`}>
            <span className="text-white">Audit</span>
            <span className="text-violet-500">Guru</span>
          </div>
          <div className={`${currentSize.tagline} font-medium tracking-[0.2em] text-violet-300 mt-1 uppercase`}>
            Find Issues. Fix Conversions. Grow Revenue.
          </div>
        </div>
      )}
    </div>
  );
};
