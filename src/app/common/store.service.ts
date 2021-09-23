import { map } from 'rxjs/operators';
import { Course } from './../model/course';
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { createHttpObservable } from './util';
import { fromPromise } from 'rxjs/internal-compatibility';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private subject = new BehaviorSubject<Course[]>([]);
  courses$: Observable<Course[]> = this.subject.asObservable();

  init(): void {
    const http$ = createHttpObservable('/api/courses');

    http$.pipe(
      map((response) => Object.values(response['payload']))
    )
    .subscribe(
      ((courses: Course[]) => this.subject.next(courses))
    );
  }

  selectBeginnerCourses(): Observable<Course[]> {
    return this.filterByCategory('beginner');
  }

  selectAdvancedCourses(): Observable<Course[]> {
    return this.filterByCategory('advanced');
  }

  saveCourse(courseId: number, value: any): Observable<any> {
    const courses = this.subject.getValue();
    const courseIndex = courses.findIndex((course: Course) => course.id === courseId);
    const newCourses = courses.slice();

    newCourses[courseIndex] = { ...courses[courseIndex], ...value };
    this.subject.next(newCourses);

    return fromPromise(
      fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(value),
        headers: { 'content-type': 'application/json' }
      })
    );
  }

  private filterByCategory(category: string): Observable<Course[]> {
    return this.courses$.pipe(
      map((courses: Course[]) => courses.filter(
        (course: Course) => course.category.toLowerCase() === category.toLowerCase())
      )
    );
  }
}
