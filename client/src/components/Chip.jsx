const TONES = {
  Critical: 'bad', High: 'warn', Low: 'mute', Failed: 'bad', 'Rolled Back': 'bad', blocked: 'bad', Suspended: 'bad', Churned: 'mute',
  Successful: 'ok', Released: 'ok', Fixed: 'ok', Verified: 'ok', Closed: 'mute', completed: 'ok', Active: 'ok', healthy: 'ok',
  attention: 'warn', critical: 'bad', archived: 'mute',
};
export const tone = (v) => TONES[v] || 'info';

export default function Chip({ v, children }) {
  return <span className={'chip ' + tone(v)}>{children ?? v}</span>;
}
