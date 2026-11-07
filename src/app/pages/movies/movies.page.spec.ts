import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { TmdbService } from '../../services/tmdb.service';

import { MoviesPage } from './movies.page';

describe('MoviesPage', () => {
  let component: MoviesPage;
  let fixture: ComponentFixture<MoviesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: TmdbService,
          useValue: { getPopularMovies: () => of({ results: [] }), searchMovies: () => of({ results: [] }) },
        },
        { provide: FirestoreService, useValue: { getCustomMovies: () => Promise.resolve([]) } },
        { provide: AuthService, useValue: { authState$: of(null) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MoviesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
