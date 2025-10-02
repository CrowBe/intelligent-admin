import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

export type CollapsibleProps = React.ComponentProps<
  typeof CollapsiblePrimitive.Root
>;

export function Collapsible({ ...props }: CollapsibleProps): React.ReactElement {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

export type CollapsibleTriggerProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleTrigger
>;

export function CollapsibleTrigger({
  ...props
}: CollapsibleTriggerProps): React.ReactElement {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

export type CollapsibleContentProps = React.ComponentProps<
  typeof CollapsiblePrimitive.CollapsibleContent
>;

export function CollapsibleContent({
  ...props
}: CollapsibleContentProps): React.ReactElement {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  );
}
