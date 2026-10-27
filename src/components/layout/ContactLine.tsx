import { CONTACT_EMAIL } from "@/lib/contact"
import { cn, focusRingClass } from "@/lib/utils"

export function ContactLine({ className = "" }: { className?: string }) {
  return (
    <p className={className || "text-muted-foreground"}>
      Contact:{" "}
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className={cn("rounded-sm text-foreground underline-offset-4 hover:underline", focusRingClass)}
      >
        {CONTACT_EMAIL}
      </a>
    </p>
  )
}
