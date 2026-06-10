export function mergeMessages(existing, incoming) {
  if (!incoming?.id) return existing;
  if (existing.some((item) => item.id === incoming.id)) return existing;
  return [...existing, incoming].sort((a, b) => a.id - b.id);
}

export function prependHistory(existing, batch) {
  const ids = new Set(existing.map((item) => item.id));
  const unique = batch.filter((item) => !ids.has(item.id));
  return [...unique, ...existing].sort((a, b) => a.id - b.id);
}
