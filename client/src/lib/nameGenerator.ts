
const adjectives = [
  'Quantum', 'Digital', 'Cosmic', 'Neural', 'Virtual', 'Cyber', 'Ethereal',
  'Binary', 'Photonic', 'Synth', 'Nano', 'Meta', 'Vector', 'Pixel'
];

const nouns = [
  'Pioneer', 'Weaver', 'Nomad', 'Sage', 'Phoenix', 'Echo', 'Pulse',
  'Spirit', 'Nexus', 'Wave', 'Node', 'Core', 'Path', 'Flow'
];

export function generateQuirkyName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}`;
}
