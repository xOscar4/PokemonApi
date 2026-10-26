export type PokemonTypeSlot = {
  slot: number;
  type: {
    name: string;
    url: string;
  };
};

export type PokemonStat = {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
};

export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
};

export type PokemonDetailResponse = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonTypeSlot[];
  stats: PokemonStat[];
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
    };
  };
};

export type PokemonListItem = {
  id: number;
  name: string;
  imageUrl: string;
  fallbackImageUrl: string;
};

export type PokemonDetail = {
  id: number;
  name: string;
  height: number;
  weight: number;
  imageUrl: string;
  fallbackImageUrl: string;
  types: string[];
  stats: {
    name: string;
    value: number;
  }[];
};
