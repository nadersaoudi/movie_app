import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class TmdbService {
  private readonly apiUrl = environment.tmdbBaseUrl;

  private readonly headers = {
    Authorization: `Bearer ${environment.tmdbToken}`,
    accept: "application/json",
  };

  constructor(private http: HttpClient) {}

  getPopularMovies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/movie/popular`, {
      headers: this.headers,
    });
  }

  searchMovies(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/movie`, {
      headers: this.headers,
      params: { query },
    });
  }

  getTrendingMovies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/trending/movie/week`, {
      headers: this.headers,
    });
  }
}
