export type IntelligenceSafety = {
  ownerOnly: boolean;
  automaticRestrictions: boolean;
};

export function isOwnerOnlyObservationMode(value: IntelligenceSafety | null | undefined) {
  return Boolean(value?.ownerOnly && !value.automaticRestrictions);
}

export function canSendIntelligenceMessage(question: string, conversationId: number | null, loading: boolean) {
  return Boolean(conversationId && question.trim() && !loading && question.trim().length <= 1200);
}

export function appendIntelligenceExchange<T extends { role: "user" | "assistant"; content: string }>(messages: T[], question: string, answer: string, create: (role: "user" | "assistant", content: string) => T) {
  return [...messages, create("user", question), create("assistant", answer)];
}
