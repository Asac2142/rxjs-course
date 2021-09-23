import { Component, OnInit } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { catchError, delayWhen, finalize, map, retryWhen, shareReplay, tap } from 'rxjs/operators';
import { createHttpObservable } from '../common/util';
import { Course } from '../model/course';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  beginnersCourses = [];
  advanceCourses = [];

  beginnersCourses$: Observable<Course[]>;
  advanceCourses$: Observable<Course[]>;

  ngOnInit() {
    // this.imperativeDesign();
    this.reactiveDesign();
  }

  private imperativeDesign(): void {
    const http$ = createHttpObservable('/api/courses');
    const courses$ = http$.pipe(
      map((response: any) => Object.values(response.payload))
    );

    // Imperative way.
    // With scalation in a project, this is going to be a callback hell
    // Let's try not to use this in the future
    courses$.subscribe((courses) => {
      this.beginnersCourses = courses.filter((course: any) => course.category === 'BEGINNER');
      this.advanceCourses = courses.filter((course: any) => course.category === 'ADVANCED');
    });
  }

  private reactiveDesign(): void {
    const courses$ = createHttpObservable('/api/courses').pipe(
      // shareReplay shares this HTTP request, so we don't make multiple calls everytime
      // we subscribe to that Observable response
      tap(() => console.log('Http request')), // side effect operator
      shareReplay(),

      // * 3
      // using retryWhen, it will retry to make the http request if it fails
      // retryWhen((error: Observable<any>) => error.pipe(
      //   delayWhen(() => timer(2000)) //delayWhen, delays the retry operation, // timer, it will wait for 2 secs
      // ))


      // for handling errors
      // Remember to return an observable from the catchError function!
      catchError((error) => {
        // * 1
        // this is a recovery error
        //  when it catches the error, we want to return a valid observable, in this case, it is an empty course array
        // instead of an empty array, we could return a array with a default course in it

        //return of([])

        // * 2
        // throwError operator
        // this operator returns an observable with the error in it

        return throwError(error)
      }),
      finalize(() => console.log('Finalized...'))
    );

    this.beginnersCourses$ = courses$.pipe(
      map((response) => Object.values(response['payload'])),
      map((courses: Course[]) => courses.filter((course) => course.category.toLowerCase() === 'beginner'))
    );

    this.advanceCourses$ = courses$.pipe(
      map((response) => Object.values(response['payload'])),
      map((courses: Course[]) => courses.filter((course) => course.category.toLowerCase() === 'advanced'))
    );

    // just for demo purposes
    // we are subscribing for a 3rd time (1rt and 2nd time subscribes are handle in the HTML template with async pipe)
    // but we are only making ONE Http request call
    courses$.subscribe();
    // if you open the network tab in the Dev tools, you will see ONE Http call /api/courses since we are using ShareReplay
  }
}
