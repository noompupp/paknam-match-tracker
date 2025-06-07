
import { ReactNode } from "react";

interface SocialMediaStoryContainerProps {
  children: ReactNode;
}

const SocialMediaStoryContainer = ({ children }: SocialMediaStoryContainerProps) => {
  return (
    <div 
      className="w-[540px] bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white overflow-hidden shadow-2xl flex flex-col relative"
      style={{ 
        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        height: '960px',
        aspectRatio: '9/16'
      }}
    >
      {children}
    </div>
  );
};

export default SocialMediaStoryContainer;
