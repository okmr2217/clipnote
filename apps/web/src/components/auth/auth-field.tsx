import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AuthField({
  id,
  label,
  error,
  className,
  ...inputProps
}: {
  id: string;
  label: string;
  error?: string;
} & Omit<React.ComponentProps<typeof Input>, "id">) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-[13px] font-semibold">
        {label}
      </Label>
      <Input
        id={id}
        aria-invalid={!!error}
        className={cn(
          "h-auto rounded-md bg-background px-3.5 py-3",
          error &&
            "border-[1.5px] border-primary aria-invalid:border-primary aria-invalid:ring-primary/30",
          className,
        )}
        {...inputProps}
      />
      {error && (
        <p role="alert" className="text-xs font-semibold text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
