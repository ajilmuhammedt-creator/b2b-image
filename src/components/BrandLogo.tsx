interface BrandLogoProps {
  className?: string;
  heightClass?: string;
}

export function BrandLogo({ className = '', heightClass = 'h-8' }: BrandLogoProps) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Light Mode: Transparent logo with dark text */}
      <img
        src="/sanford-ai-logo-light.png"
        onError={(e) => {
          // Graceful fallback until user places sanford-ai-logo-light.png in public/
          const target = e.currentTarget;
          if (target.src.indexOf('sanford-ai-logo-light.png') !== -1) {
            target.src = '/sanford-ai-logo.png';
            target.style.filter = 'invert(1) hue-rotate(180deg) brightness(0.85) contrast(1.1)';
          }
        }}
        alt="Sanford AI"
        className={`${heightClass} w-auto object-contain block dark:hidden transition-opacity duration-200`}
      />

      {/* Dark Mode: Existing logo with mix-blend-screen */}
      <img
        src="/sanford-ai-logo.png"
        alt="Sanford AI"
        className={`${heightClass} w-auto object-contain hidden dark:block mix-blend-screen transition-opacity duration-200`}
      />
    </div>
  );
}

