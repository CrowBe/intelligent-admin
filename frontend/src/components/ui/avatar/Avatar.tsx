"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

/**
 * Avatar - A component for displaying user profile images with automatic fallback
 *
 * Used throughout the intelligent admin interface for:
 * - User profiles (trade business owners)
 * - Client avatars (customer listings)
 * - Team member identification
 * - Chat interface participants
 *
 * @example
 * ```tsx
 * <Avatar>
 *   <AvatarImage src="https://example.com/user.jpg" alt="John Smith" />
 *   <AvatarFallback>JS</AvatarFallback>
 * </Avatar>
 * ```
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    data-slot="avatar"
    className={cn(
      "relative flex size-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

/**
 * AvatarImage - The image element within an Avatar
 *
 * Automatically handles:
 * - Image loading states
 * - Failed image loads (displays fallback)
 * - Aspect ratio preservation
 *
 * @example
 * ```tsx
 * <AvatarImage
 *   src="https://example.com/user.jpg"
 *   alt="User name"
 * />
 * ```
 */
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    data-slot="avatar-image"
    className={cn("aspect-square size-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

/**
 * AvatarFallback - Fallback content when image fails to load or is loading
 *
 * Typically displays:
 * - User initials (e.g., "JS" for John Smith)
 * - Default icons
 * - Placeholder content
 *
 * @example
 * ```tsx
 * <AvatarFallback>JS</AvatarFallback>
 * ```
 */
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    data-slot="avatar-fallback"
    className={cn(
      "bg-muted flex size-full items-center justify-center rounded-full",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
