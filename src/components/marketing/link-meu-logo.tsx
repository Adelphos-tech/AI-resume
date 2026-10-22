import Image from "next/image";

/**
 * LinkMeU brand wordmark — the approved logo asset rendered from
 * /brand/linkmeu-wordmark.png (navy "Link"/"U", primary-green "Me",
 * transparent background). Height is controlled by the caller via
 * className; width scales automatically to preserve proportions.
 *
 * `variant="dark"` swaps to the dark-surface asset
 * /brand/linkmeu-wordmark-dark.png (near-white "Link"/"U", same green
 * "Me") for surfaces where the navy lettering is unreadable.
 */
export function LinkMeuLogo({
  className = "h-8",
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  return (
    <Image
      src={
        variant === "dark"
          ? "/brand/linkmeu-wordmark-dark.png"
          : "/brand/linkmeu-wordmark.png"
      }
      alt="LinkMeU"
      width={199}
      height={45}
      className={`w-auto ${className}`}
    />
  );
}
