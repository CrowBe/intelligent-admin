import { useTheme } from "@/components/theme-provider";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

export type SonnerProps = ToasterProps;

export function Toaster({ ...props }: SonnerProps): React.ReactElement {
  const { theme = "system" } = useTheme();

  return (
    <SonnerToaster
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
