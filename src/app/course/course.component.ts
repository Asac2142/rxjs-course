import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Course } from "../model/course";
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  tap,
  delay,
  map,
  concatMap,
  switchMap,
  withLatestFrom,
  concatAll, shareReplay, throttle
} from 'rxjs/operators';
import { merge, fromEvent, Observable, concat, of, interval } from 'rxjs';
import { Lesson } from '../model/lesson';
import { createHttpObservable } from '../common/util';

@Component({
  selector: 'course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {
  course$: Observable<Course>;
  lessons$: Observable<Lesson[]>;
  courseId!: string;

  @ViewChild('searchInput', { static: true }) input: ElementRef;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.courseId = this.route.snapshot.params['id'];
    this.loadData();
  }

  ngAfterViewInit() {
    const initialLessons$ = this.loadLessons$();
    // the switchMap is an operator that unsubscribes to the current observable if a new
    // observable arrives, in this case, as we start typing, having the debounceTime and
    // distinctUntilChanged operators to reducer duplicates and delay the search, after getting a new value, the on going http request
    // will be canceled, unsubscribe, and inmedialty, it subscribes to the new value
    this.lessons$ = fromEvent<any>(this.input.nativeElement, 'keyup').pipe(
      map((event) => event.target.value),
      debounceTime(400), // delay of 400 ms
      startWith(''), //the startWith operator emits the first value with the given value, which in this case, the empty string, mirar exampleWithStartWith():
      distinctUntilChanged(), // avoid duplicates
      switchMap((search) => this.loadLessons$(search))
    );

    // aqui se usa el concat para concatenar los 2 observables, el 1er que carga los lessons (todos), y el 2ndo,
    // lo que vas buscando. el concat es como el concatMap, se basa en completion, cuando termina initialLessons$, continua con search$

    // this.lessons$ = concat(initialLessons$, search$);

    // en vez de usar el concat, podemos usar el operador startsWith --> mira arriba, linea 48
  }

  private loadData(): void {
    this.course$ = createHttpObservable(`/api/courses/${this.courseId}`);
  }

  private loadLessons$(search?: string) {
    return createHttpObservable(`/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${search || ''}`).pipe(
      map((response) => response['payload'])
    );
  }

  private exampleWithStartWith(): void {
    //emit (1,2,3)
    const source = of(1, 2, 3);
    //start with 0
    const example = source.pipe(startWith(0));
    //output: 0,1,2,3
    const subscribe = example.subscribe(val => console.log(val));
  }

  private exampleWithThrottle(): void {
    // we are using throttle here for learning purposes
    // with the RxJs throttle operator, it kind of similar with debounceTime but, it works differently
    // with throttle, we are saying emit a value each 500 ms, not very usable for searching
    // so each 500 ms, throttle grabs the first value, and it waits for another 500 ms, and grabs another one
    // so for searching, we could start typing Hello, but using this operator, we only would grab the letter "H"
    // and the backend will be searching something with H instead of "Hello"
    fromEvent<any>(this.input.nativeElement, 'keyup').pipe(
      map((event) => event.target.value),
      throttle(() => interval(500)),
      startWith(''),
      distinctUntilChanged(),
      switchMap((search) => this.loadLessons$(search))
    )
    .subscribe(console.log);
  }
}
