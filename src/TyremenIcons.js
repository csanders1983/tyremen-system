const IconWrap = ({ children }) => (
  <svg className="tyremenIcon" viewBox="0 0 64 64" fill="none">
    {children}
  </svg>
);

export const TyreIcon = () => (
  <IconWrap>
    <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="5" />
    <circle cx="32" cy="32" r="11" stroke="currentColor" strokeWidth="5" />
    <path d="M32 8v10M32 46v10M8 32h10M46 32h10M15 15l7 7M42 42l7 7M49 15l-7 7M22 42l-7 7" stroke="#ffd000" strokeWidth="4" strokeLinecap="round" />
  </IconWrap>
);

export const ServiceIcon = () => (
  <IconWrap>
    <path d="M43 8l-9 9 13 13 9-9c2 10-6 19-16 17L20 58 6 44l20-20C24 14 33 6 43 8z" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
    <path d="M13 45l6 6" stroke="#ffd000" strokeWidth="5" strokeLinecap="round" />
  </IconWrap>
);

export const BrakeIcon = () => (
  <IconWrap>
    <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="5" />
    <circle cx="32" cy="32" r="7" stroke="currentColor" strokeWidth="5" />
    <path d="M46 18c7 8 7 20 0 28" stroke="#ffd000" strokeWidth="5" strokeLinecap="round" />
    <path d="M18 46c-7-8-7-20 0-28" stroke="#ffd000" strokeWidth="5" strokeLinecap="round" />
  </IconWrap>
);

export const MotIcon = () => (
  <IconWrap>
    <path d="M32 7l26 50H6L32 7z" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
    <path d="M32 22v15" stroke="#ffd000" strokeWidth="6" strokeLinecap="round" />
    <circle cx="32" cy="47" r="3" fill="#ffd000" />
  </IconWrap>
);

export const AirConIcon = () => (
  <IconWrap>
    <path d="M32 6v52M10 19l44 26M54 19L10 45" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <circle cx="32" cy="32" r="5" fill="#ffd000" />
  </IconWrap>
);

export const ClutchIcon = () => (
  <IconWrap>
    <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="5" />
    <circle cx="32" cy="32" r="7" stroke="#ffd000" strokeWidth="5" />
    <path d="M32 4v10M32 50v10M4 32h10M50 32h10M12 12l7 7M45 45l7 7M52 12l-7 7M19 45l-7 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
  </IconWrap>
);

export const BatteryIcon = () => (
  <IconWrap>
    <rect x="6" y="20" width="46" height="28" rx="4" stroke="currentColor" strokeWidth="5" />
    <path d="M52 29h6v10h-6" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
    <path d="M20 34h10M25 29v10M37 34h10" stroke="#ffd000" strokeWidth="5" strokeLinecap="round" />
  </IconWrap>
);

export const DiagnosticsIcon = () => (
  <IconWrap>
    <rect x="10" y="13" width="44" height="32" rx="4" stroke="currentColor" strokeWidth="5" />
    <path d="M20 54h24" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path d="M32 45v9" stroke="currentColor" strokeWidth="5" />
    <path d="M22 30h7l4-7 5 15 4-8h6" stroke="#ffd000" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
  </IconWrap>
);