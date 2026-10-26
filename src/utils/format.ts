export function formatPokemonName(name: string) {
  return name
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatPokemonId(id: number) {
  return `#${String(id).padStart(4, '0')}`;
}

export function formatHeight(decimeters: number) {
  return `${(decimeters / 10).toFixed(1)} m`;
}

export function formatWeight(hectograms: number) {
  return `${(hectograms / 10).toFixed(1)} kg`;
}
