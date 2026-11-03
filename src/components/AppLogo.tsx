/** The app logo: four equalizer bars, matching public/favicon.svg. Uses the current text color. */
export function AppLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="9" width="3" height="6" rx="1.5" />
      <rect x="7.5" y="4.5" width="3" height="15" rx="1.5" />
      <rect x="12" y="1.5" width="3" height="21" rx="1.5" />
      <rect x="16.5" y="6" width="3" height="12" rx="1.5" />
    </svg>
  )
}
