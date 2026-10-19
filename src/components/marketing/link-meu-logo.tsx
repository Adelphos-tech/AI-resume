import Image from "next/image";

/**
 * LinkMeU brand wordmark — the approved logo asset rendered from
 * /brand/linkmeu-wordmark.png (navy "Link"/"U", primary-green "Me",
 * transparent background). Height is controlled by the caller via
 * className; width scales automatically to preserve proportions.
 */
export function LinkMeuLogo({ className = "h-7" }: { className?: string }) {
  return (
    <Image
      src="/brand/linkmeu-wordmark.png"
      alt="LinkMeU"
      width={507}
      height={121}
      className={`w-auto ${className}`}
    />
  );
}
