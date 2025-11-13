import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

export type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root>;

export function Drawer({ ...props }: DrawerProps): React.ReactElement {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

export type DrawerTriggerProps = React.ComponentProps<
  typeof DrawerPrimitive.Trigger
>;

export function DrawerTrigger({ ...props }: DrawerTriggerProps): React.ReactElement {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

export type DrawerPortalProps = React.ComponentProps<
  typeof DrawerPrimitive.Portal
>;

export function DrawerPortal({ ...props }: DrawerPortalProps): React.ReactElement {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

export type DrawerCloseProps = React.ComponentProps<typeof DrawerPrimitive.Close>;

export function DrawerClose({ ...props }: DrawerCloseProps): React.ReactElement {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

export type DrawerOverlayProps = React.ComponentProps<
  typeof DrawerPrimitive.Overlay
>;

export function DrawerOverlay({
  className,
  ...props
}: DrawerOverlayProps): React.ReactElement {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

export type DrawerContentProps = React.ComponentProps<
  typeof DrawerPrimitive.Content
>;

export function DrawerContent({
  className,
  children,
  ...props
}: DrawerContentProps): React.ReactElement {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className,
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

export type DrawerHeaderProps = React.ComponentProps<"div">;

export function DrawerHeader({ className, ...props }: DrawerHeaderProps): React.ReactElement {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

export type DrawerFooterProps = React.ComponentProps<"div">;

export function DrawerFooter({ className, ...props }: DrawerFooterProps): React.ReactElement {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

export type DrawerTitleProps = React.ComponentProps<typeof DrawerPrimitive.Title>;

export function DrawerTitle({
  className,
  ...props
}: DrawerTitleProps): React.ReactElement {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

export type DrawerDescriptionProps = React.ComponentProps<
  typeof DrawerPrimitive.Description
>;

export function DrawerDescription({
  className,
  ...props
}: DrawerDescriptionProps): React.ReactElement {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}
