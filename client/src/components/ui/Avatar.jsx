import { forwardRef } from "react";

export const Avatar = forwardRef(
  ({ src, alt, label, size = "md", className = "", ...props }, ref) => {
    const sizeClasses = {
      xs: "size-6 text-[10px]",
      sm: "size-8 text-xs",
      md: "size-10 text-sm",
      lg: "size-12 text-base",
      xl: "size-16 text-lg",
      "2xl": "size-24 text-xl",
    };

    const getInitials = (name) => {
      if (!name) return "?";
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const initials = label ? getInitials(label) : "?";

    // Generate consistent color from label
    const getColor = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = Math.abs(hash) % 360;
      return `hsl(${hue}, 55%, 45%)`;
    };

    const bgColor = label ? getColor(label) : "var(--color-primary)";

    if (src) {
      return (
        <img
          ref={ref}
          src={src}
          alt={alt || label || "Avatar"}
          className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
          {...props}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={`avatar inline-flex items-center justify-center rounded-full font-semibold select-none ${sizeClasses[size]} ${className}`}
        style={{ backgroundColor: bgColor, color: "white" }}
        aria-label={label}
        {...props}
      >
        {initials}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export const AvatarGroup = forwardRef(
  ({ children, max = 5, size = "md", className = "", ...props }, ref) => {
    const sizeClasses = {
      xs: "size-6 -ml-1",
      sm: "size-8 -ml-2",
      md: "size-10 -ml-2",
      lg: "size-12 -ml-3",
      xl: "size-16 -ml-4",
      "2xl": "size-24 -ml-6",
    };

    const kids = Array.isArray(children) ? children : [children];
    const visible = kids.slice(0, max);
    const remaining = kids.length - max;

    return (
      <div ref={ref} className={`flex ${className}`} {...props}>
        {visible.map((child, index) => (
          <div key={index} className={`relative ${sizeClasses[size]} ${index === 0 ? "ml-0" : ""} z-[${visible.length - index}]`}>
            {child}
          </div>
        ))}
        {remaining > 0 && (
          <div
            className={`avatar inline-flex items-center justify-center rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] font-medium border-2 border-[var(--color-surface)] ${sizeClasses[size]} relative z-0`}
          >
            +{remaining}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";