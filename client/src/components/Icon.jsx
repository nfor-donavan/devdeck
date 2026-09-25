const P = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  projects: <><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></>,
  tasks: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 12l3 3 5-6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  week: <><rect x="3" y="4" width="4" height="16" rx="1" /><rect x="10" y="4" width="4" height="11" rx="1" /><rect x="17" y="4" width="4" height="14" rx="1" /></>,
  clients: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.5-4 3.2-6 6.5-6s6 2 6.5 6" /><path d="M16 4.5a3.5 3.5 0 010 7M18 14c2.2.6 3.5 2.6 3.5 6" /></>,
  tenants: <><path d="M4 21V5a1 1 0 011-1h9a1 1 0 011 1v16M15 9h4a1 1 0 011 1v11M2 21h20" /><path d="M8 8h3M8 12h3M8 16h3" /></>,
  deployments: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" /></>,
  maintenance: <><path d="M14.5 6.5a4 4 0 005 5l-9.6 9.6a2.1 2.1 0 01-3-3l9.6-9.6a4 4 0 00-2-2z" /></>,
  bugs: <><rect x="8" y="8" width="8" height="12" rx="4" /><path d="M9 8a3 3 0 016 0M4 13h4M16 13h4M5 7l3 3M19 7l-3 3M5 20l3-3M19 20l-3-3" /></>,
  roadmap: <><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></>,
  analytics: <><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></>,
  notes: <><path d="M6 3h8l5 5v13H6z" /><path d="M14 3v5h5M9 13h7M9 17h7" /></>,
  settings: <><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></>,
  bell: <><path d="M6 16v-5a6 6 0 1112 0v5l2 2H4z" /><path d="M10 21h4" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4-4" /></>,
  shield: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>,
  logout: <><path d="M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4M16 8l4 4-4 4M20 12H9" /></>,
};

export default function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name]}
    </svg>
  );
}
