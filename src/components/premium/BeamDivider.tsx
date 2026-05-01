'use client';

/**
 * BeamDivider — An animated laser-beam section divider.
 * A light streak sweeps continuously across a thin line.
 * Use between sections for premium visual separation.
 */
interface BeamDividerProps {
  className?: string;
}

export default function BeamDivider({ className = '' }: BeamDividerProps) {
  return (
    <div className={`beam-divider ${className}`} aria-hidden="true" />
  );
}
