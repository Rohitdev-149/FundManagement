import { forwardRef } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import { Avatar } from "./Avatar";

const PageHeader = forwardRef(
  (
    {
      title,
      subtitle,
      avatar,
      avatarLabel,
      avatarSrc,
      actions,
      breadcrumbs,
      className = "",
      showDivider: _showDivider = true,
    },
    ref,
  ) => {
    return (
      <header ref={ref} className={`page-header ${className}`}>
        <div className="flex-1 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              className="mb-2 flex items-center gap-1.5 text-sm"
              aria-label="Breadcrumb"
            >
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <svg
                      className="size-3.5 text-[var(--color-text-tertiary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                  {crumb.href ? (
                    <Link
                      to={crumb.href}
                      className="text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className="text-[var(--color-text-primary)] font-medium"
                      aria-current="page"
                    >
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="page-title truncate">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {actions && (
            <div className="hidden items-center gap-2 sm:flex">
              {actions.map((action, index) => (
                <Button key={index} {...action} />
              ))}
            </div>
          )}
          {avatar && (
            <div className="flex items-center gap-2">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={avatarLabel || ""}
                  className="size-10 rounded-full bg-[var(--color-surface-hover)] object-cover"
                />
              ) : (
                <Avatar size="lg" label={avatarLabel} />
              )}
            </div>
          )}
        </div>
      </header>
    );
  },
);

PageHeader.displayName = "PageHeader";

export default PageHeader;
