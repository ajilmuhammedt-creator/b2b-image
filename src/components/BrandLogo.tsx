interface BrandLogoProps {
  className?: string;
  heightClass?: string;
}

export function BrandLogo({ className = '', heightClass = 'h-8' }: BrandLogoProps) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src="/sanford-ai-logo.png"
        alt="Sanford AI"
        className={`${heightClass} w-auto object-contain mix-blend-screen transition-opacity duration-200`}
      />
    </div>
  );
}

