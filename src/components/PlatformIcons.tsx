interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Official Shopify Logo Mark (Green Shopping Bag with 'S')
 */
export function ShopifyIcon({ className = 'w-4 h-4', size }: IconProps) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
      aria-label="Shopify"
    >
      {/* Bag Handle */}
      <path
        d="M14.5 4.5c-.3-1.6-1.5-2.8-2.9-2.8s-2.6 1.2-2.9 2.8H7l-1.5 15h13L17 4.5h-2.5zm-4.3 0c.2-1 .9-1.8 1.8-1.8s1.6.8 1.8 1.8h-3.6z"
        fill="#95BF47"
      />
      {/* Front Fold / White S Highlight */}
      <path
        d="M12.8 10.2c-.7-.1-1.3-.3-1.3-.8 0-.4.4-.7 1-.7.7 0 1.3.3 1.8.8l1-.9c-.7-.7-1.7-1.1-2.8-1.1-1.4 0-2.4.9-2.4 2.1 0 1.3 1 1.8 2.2 2 .8.1 1.4.3 1.4.8 0 .5-.5.8-1.2.8-.8 0-1.6-.4-2.1-1l-1 .9c.8.9 1.9 1.3 3.1 1.3 1.6 0 2.6-.9 2.6-2.2-.1-1.2-1.1-1.8-2.3-1.9z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/**
 * Official Amazon Logo Mark (Curved Smile Arrow & 'a')
 */
export function AmazonIcon({ className = 'w-4 h-4', size }: IconProps) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      aria-label="Amazon"
    >
      {/* Amazon 'a' glyph */}
      <path
        d="M13.5 12.8c0 1.2-.5 1.9-1.6 1.9-.9 0-1.3-.6-1.3-1.4 0-1.3.9-1.9 2.9-2v1.5zm1.8-4.2h-1.8v.8c-.5-.6-1.3-1-2.3-1-1.8 0-3 1.3-3 3.3 0 1.9 1.1 3.2 2.8 3.2 1 0 1.9-.5 2.5-1.2v1.1h1.8V8.6z"
        fill="currentColor"
      />
      {/* Iconic Amazon Smile Arrow in Vibrant Orange */}
      <path
        d="M4.5 17.5c4 2.8 10.5 2.8 14.5-.4.3-.2.6.1.4.4-4.4 3.7-11.4 3.7-15.3.4-.3-.2 0-.6.4-.4z"
        fill="#FF9900"
      />
      {/* Arrowhead */}
      <path
        d="M19.7 16.3c-.2-.3-1.1-.1-1.7 0-.2 0-.2-.2 0-.3.7-.6 1.9-.4 2.1-.2.2.2 0 1.4-.6 2-.2.2-.3.1-.3 0 .1-.5.7-1.2.5-1.5z"
        fill="#FF9900"
      />
    </svg>
  );
}

/**
 * Official Noon UAE Logo Mark (Distinctive Yellow Circle with Authentic Noon Glyph)
 */
export function NoonIcon({ className = 'w-4 h-4', size }: IconProps) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      aria-label="Noon UAE"
    >
      {/* Noon Signature Yellow Circle Background */}
      <circle cx="12" cy="12" r="11" fill="#FEEE00" />
      {/* Stylized Noon Arabic/English Loop & Dot in Pure Black */}
      <path
        d="M12 7.2a4.8 4.8 0 100 9.6 4.8 4.8 0 000-9.6zm0 7.2a2.4 2.4 0 110-4.8 2.4 2.4 0 010 4.8z"
        fill="#000000"
      />
      <circle cx="12" cy="12" r="1.3" fill="#000000" />
    </svg>
  );
}
