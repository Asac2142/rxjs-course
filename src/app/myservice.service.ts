import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MyService {
  // this is a good practice
  // if we need a subject, we should set it private
  // and expose functions for emitting and getting that emitted value
  private emitter = new Subject<boolean>();

  // we call this function for emitting the value by using next()
  emit(value: boolean): void {
    this.emitter.next(value);
  }

  // here, we return not the Subject but the Subject as an Observable
  // with this, we avoid from outside to emit other values, aka next()
  // we also avoid exposing functions such as complete(), error(), next()
  // that belongs to the observer
  // we are only intersted in the subscribe() function
  getEmitter(): Observable<boolean> {
    return this.emitter.asObservable();
  }

  /** FUNCTIONS AVAILABLE FOR EACH:
   *
   * > Observable:  subscribe()
   *
   * > Subject: subscribe(), next(), error(), complete(), observers[]
   *
   * > Observer: next(), error(), complete()
   *
   */


  /** What is an Observable and an Observer
   *
   * -------------
   *  OBSERVABLE:
   * -------------
   *  getMovies(): Observable<Movie[]> {
   *    return this.http.get(url);
   *  }
   *
   * -------------
   *   OBSERVER:
   * -------------
   *  this.movieService.getMovies()
   *    .subscribe(  ====> Subscribe
   *      (movie: Movie[]) => this.movies = movie,   ====> Observer
   *      (error: any) => this.errorMessage = error
   *     )
   *
   * The subscribe functions takes in an OBSERVER, an observer has 3 functions
   * next(), error(), complete()
   */
}
