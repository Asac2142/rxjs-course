import { Component, OnInit } from '@angular/core';
import { fromEvent, noop, Subscription, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { createHttpObservable } from '../common/util';

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.whatIsAnObservable();
    this.creatingAnObservable();
    this.exampleWithSubject();
    this.exampleWithBehaviorSubject();
    this.exampleWithAsyncSubject();
    this.exampleWithReplaySubject();
  }

  private whatIsAnObservable(): void {
    // definition of a STREAM of values
    // the definition of a stream of values is an Observable
    // in this case, intervals$ is the Observable
    const intervals$ = timer(3000, 1000);

    // here, this is where the stream of values start to execute when we subscribe to this Observable.
    const sub1: Subscription = intervals$.subscribe((value: number) => console.log('STREAM 1 - ', value));
    const sub2: Subscription = intervals$.subscribe((value: number) => console.log('STREAM 2 - ', value));

    // another definition of a stream of values
    // clicks in the whole document object
    const click$ = fromEvent(document, 'click');

    // every time we click, we emit a stream of values
    click$.subscribe((evt) => console.log(evt));

    // after 10 secs, we unsubscribe from these 2 observables
    setTimeout(() => {
      sub1?.unsubscribe();
      sub2?.unsubscribe();
    }, 10000)
  }

  private creatingAnObservable(): void {
    const http$ = createHttpObservable('/api/courses');

    // getting directly the Http response
    http$.subscribe(
      (response) => console.log('Http response:', response),
      noop, // noop is a RxJs operator, stands for: no operation, since we are not getting errors, no operation needed
      () => console.log('completed') //complete
    );

    // using RxJs "map" operator to handle the response, and getting back our courses array
    // map is a Transformation operator that returns an Observable
    // we are transforming the http response into a new observable, by just grabbing the courses, nothing else
    const courses$ = http$.pipe(
      map((response: any) => Object.values(response.payload))
    );

    courses$.subscribe((courses) => console.log('Courses:', courses));
  }
  
    private exampleWithSubject(): void {
    // a Subject is a special type of Observable
    // this observable has no "memory", it can't subscribe to a value
    // that WAS emitted before
    const subject = new Subject();
    const observable$ = subject.asObservable();

    observable$.subscribe((value) => console.log('early sub:', value));

    subject.next(1);
    subject.next(2);
    subject.next(3);
    // output will be: early sub: 1,  early sub: 2,  early sub: 3

    setTimeout(() => {
      // here, will not be any output...
      // it doesn't have any "memory" of the latest value
      observable$.subscribe((value) => console.log('late sub:', value));
    }, 3000);
  }

  private exampleWithBehaviorSubject(): void {
    // the BehaviorSubject can access to the last emitted value
    // comparing to Subject, BehaviorSubject has a memory of the previous value
    const subject = new BehaviorSubject(0);
    const observable$ = subject.asObservable();

    observable$.subscribe((value) => console.log('early sub:', value));

    subject.next(1);
    subject.next(2);
    subject.next(3);
    // output will be: early sub: 1,  early sub: 2,  early sub: 3

    setTimeout(() => {
      // here, after 3 secs, we will see an output
      // output will be: late sub: 3
      observable$.subscribe((value) => console.log('late sub:', value));
    }, 3000);
  }

  private exampleWithAsyncSubject(): void {
    // the asyncSubject only will emitt the LAST value
    // when it COMPLETES.
    const subject = new AsyncSubject();
    const observable$ = subject.asObservable();

    observable$.subscribe((value) => console.log('early sub:', value));

    subject.next(1);
    subject.next(2);
    subject.next(3);

    subject.complete(); // completed

    // only takes the last value
    // output will be: early sub: 3

    setTimeout(() => {
      // here, after 3 secs, we will see an output
      // output will be: late sub: 3
      observable$.subscribe((value) => console.log('late sub:', value));
    }, 3000);
  }

  private exampleWithReplaySubject(): void {
    const subject = new ReplaySubject();
    const observable$ = subject.asObservable();

    observable$.subscribe((value) => console.log('early sub:', value));

    subject.next(1);
    subject.next(2);
    subject.next(3);

    subject.complete(); // here, it doesn't matter if we complete or not
    // either way, with ReplaySubject, we will have access to all emitted values
    // output will be: early sub: 1, early sub: 2, early sub: 3

    setTimeout(() => {
      // here, after 3 secs, we will have access to all previous values
      // output will be: early sub: 1, early sub: 2, early sub: 3
      observable$.subscribe((value) => console.log('late sub:', value));
    }, 3000);
  }

  private whatIsAnObservable(): void {
    // definition of a STREAM of values
    // the definition of a stream of values is an Observable
    // in this case, intervals$ is the Observable
    const intervals$ = timer(3000, 1000);

    // here, this is where the stream of values start to execute when we subscribe to this Observable.
    const sub1: Subscription = intervals$.subscribe((value: number) =>
      console.log('STREAM 1 - ', value)
    );
    const sub2: Subscription = intervals$.subscribe((value: number) =>
      console.log('STREAM 2 - ', value)
    );

    // another definition of a stream of values
    // clicks in the whole document object
    const click$ = fromEvent(document, 'click');

    // every time we click, we emit a stream of values
    click$.subscribe((evt) => console.log(evt));

    // after 10 secs, we unsubscribe from these 2 observables
    setTimeout(() => {
      sub1?.unsubscribe();
      sub2?.unsubscribe();
    }, 10000);
  }

  private creatingAnObservable(): void {
    const http$ = createHttpObservable('/api/courses');

    // getting directly the Http response
    http$.subscribe(
      (response) => console.log('Http response:', response),
      noop, // noop is a RxJs operator, stands for: no operation, since we are not getting errors, no operation needed
      () => console.log('completed') // complete
    );

    // using RxJs "map" operator to handle the response, and getting back our courses array
    // map is a Transformation operator that returns an Observable
    // we are transforming the http response into a new observable, by just grabbing the courses, nothing else
    const courses$ = http$.pipe(
      map((response: any) => Object.values(response.payload))
    );

    courses$.subscribe((courses) => console.log('Courses:', courses));
  }
}
