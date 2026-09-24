import { HEALTH_LABEL } from '../utils/constants.js';

const CLS = { healthy: 'g', attention: 'y', critical: 'r', archived: 'm' };

export default function HealthBadge({ health, reasons = [], label }) {
  return (
    <span title={reasons.join(', ')}>
      <span className={'dot ' + CLS[health]} />
      {label && HEALTH_LABEL[health]}
    </span>
  );
}
