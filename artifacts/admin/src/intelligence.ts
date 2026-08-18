export type IntelligenceSafety = {
  ownerOnly: boolean;
  automaticRestrictions: boolean;
};

export function isOwnerOnlyObservationMode(value: IntelligenceSafety | null | undefined) {
  return Boolean(value?.ownerOnly && !value.automaticRestrictions);
}
