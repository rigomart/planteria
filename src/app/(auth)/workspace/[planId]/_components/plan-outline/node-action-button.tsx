import { Button } from "@/components/ui/button";

type NodeActionButtonProps = {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
};

export function NodeActionButton({
  icon: Icon,
  label,
  onClick,
}: NodeActionButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={onClick}
      aria-label={label}
    >
      <Icon className="size-4" />
    </Button>
  );
}
