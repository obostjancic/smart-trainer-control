import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { css, cx } from "styled-system/css";

type SportButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "control";

interface SportButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SportButtonVariant;
  children: ReactNode;
}

const baseStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1.5",
  fontFamily: "var(--font-body)",
  fontWeight: "600",
  borderRadius: "lg",
  cursor: "pointer",
  transition: "all 0.15s ease",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent",
  _hover: {
    transform: "translateY(-1px)",
  },
  _active: {
    transform: "scale(0.95) !important",
    transition: "all 0.06s ease",
  },
  _disabled: {
    opacity: 0.3,
    cursor: "not-allowed",
    transform: "none !important",
    filter: "none !important",
  },
});

const variantStyles: Record<SportButtonVariant, string> = {
  primary: css({
    background: "var(--color-power)",
    color: "#0a0a0f",
    border: "none",
    _hover: {
      filter: "brightness(1.1)",
      boxShadow: "var(--glow-power)",
    },
  }),
  secondary: css({
    background: "var(--color-btn-bg)",
    color: "var(--color-text-muted)",
    border: "1px solid var(--color-btn-border)",
    _hover: {
      background: "var(--color-btn-hover)",
      color: "var(--color-text)",
      borderColor: "var(--color-text-muted)",
    },
  }),
  danger: css({
    background: "var(--color-btn-bg)",
    color: "var(--color-danger)",
    border: "1px solid var(--color-danger)",
    opacity: 0.7,
    _hover: {
      opacity: 1,
      boxShadow: "0 0 12px rgba(255, 59, 92, 0.2)",
    },
  }),
  ghost: css({
    background: "transparent",
    color: "var(--color-text-muted)",
    border: "1px solid transparent",
    _hover: {
      background: "var(--color-btn-bg)",
      color: "var(--color-text)",
      borderColor: "var(--color-btn-border)",
    },
  }),
  control: css({
    background: "var(--color-btn-bg)",
    color: "var(--color-text)",
    border: "1px solid var(--color-btn-border)",
    _hover: {
      background: "var(--color-btn-hover)",
      borderColor: "var(--color-text-muted)",
    },
  }),
};

export const SportButton = forwardRef<HTMLButtonElement, SportButtonProps>(
  ({ variant = "secondary", className, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={cx(baseStyle, variantStyles[variant], className)}
      {...rest}
    >
      {children}
    </button>
  )
);

SportButton.displayName = "SportButton";
