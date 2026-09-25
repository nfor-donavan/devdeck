import { useId } from 'react';

/**
 * DevDeck mark: a "D" built from three stacked plates, like a deck of layers.
 * The gold middle plate sits slightly out of line: the one item that needs your attention.
 */
export default function Logo({ size = 36, text = true, tagline, light }) {
  const id = useId().replace(/:/g, '');
  const D = 'M13 11H25A13 13 0 0 1 25 37H13Z';
  return (
    <span className={'logo' + (light ? ' light' : '')}>
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="DevDeck">
        <defs>
          <linearGradient id={`bg${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#12386b" /><stop offset="1" stopColor="#06162e" /></linearGradient>
          <linearGradient id={`gd${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4c874" /><stop offset="1" stopColor="#d69a2a" /></linearGradient>
          <clipPath id={`t${id}`}><rect x="0" y="0" width="48" height="18.4" /></clipPath>
          <clipPath id={`m${id}`}><rect x="0" y="20.6" width="48" height="6.8" /></clipPath>
          <clipPath id={`b${id}`}><rect x="0" y="29.6" width="48" height="20" /></clipPath>
        </defs>
        <rect width="48" height="48" rx="12" fill={`url(#bg${id})`} />
        <rect x=".5" y=".5" width="47" height="47" rx="11.5" fill="none" stroke="#ffffff" strokeOpacity=".14" />
        <g transform="translate(-1.5 0)">
          <g clipPath={`url(#t${id})`}><path d={D} fill="#fff" /></g>
          <g clipPath={`url(#m${id})`} transform="translate(3 0)"><path d={D} fill={`url(#gd${id})`} /></g>
          <g clipPath={`url(#b${id})`}><path d={D} fill="#c9d6ea" /></g>
        </g>
      </svg>
      {text && (
        <span className="wm">
          <span className="wm-name"><b>Dev</b>Deck</span>
          {tagline && <span className="wm-tag">{tagline}</span>}
        </span>
      )}
    </span>
  );
}
