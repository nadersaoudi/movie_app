import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { IonicModule } from "@ionic/angular/lazy";

import { environment } from "../../environments/environment";
import { TmdbService } from "../services/tmdb.service";
import { Movie, MovieResponse } from "../models/movie.model";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink],
})
export class HomePage implements OnInit {
  readonly imageUrl = environment.tmdbImageUrl;
  movies: Movie[] = [];
  isLoading = true;
  errorMessage = "";
  searchQuery = "";

  constructor(private readonly tmdbService: TmdbService) {}

  ngOnInit(): void {
    this.loadPopularMovies();
  }

  loadPopularMovies(): void {
    this.isLoading = true;
    this.errorMessage = "";
    this.searchQuery = "";

    this.tmdbService.getPopularMovies().subscribe({
      next: (response: MovieResponse) => {
        this.movies = response.results ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = "Unable to load movies.";
        this.isLoading = false;
      },
    });
  }

  onSearch(event: CustomEvent): void {
    const query = (event.detail.value ?? "").trim();
    this.searchQuery = query;

    if (!query) {
      this.loadPopularMovies();
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";

    this.tmdbService.searchMovies(query).subscribe({
      next: (response: MovieResponse) => {
        this.movies = response.results ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = "Unable to search movies.";
        this.isLoading = false;
      },
    });
  }
}
