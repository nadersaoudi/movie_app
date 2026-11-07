export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
}
export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface MovieCredits {
  cast: CastMember[];
}

export interface MovieDetail extends Movie {
  genres: Genre[];
  runtime: number;
  vote_count: number;
  tagline: string;
  status: string;
  popularity: number;
  budget: number;
  revenue: number;
  original_language: string;
  original_title: string;
  homepage: string | null;
  credits?: MovieCredits;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
}

export interface FavoriteMovie {
  movieId: string;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genres: string[];
  actors: string[];
  createdAt: number;
}

export interface CustomMovie {
  id: string;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genres: string[];
  actors: string[];
  createdBy: string;
  createdAt: number;
}
