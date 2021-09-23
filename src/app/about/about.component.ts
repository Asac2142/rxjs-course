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
}
