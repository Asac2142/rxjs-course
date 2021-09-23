import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Course } from "../model/course";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import * as moment from 'moment';
import { fromPromise } from 'rxjs/internal-compatibility';
import { concatMap, exhaust, exhaustMap, filter, mergeMap } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'course-dialog',
  templateUrl: './course-dialog.component.html',
  styleUrls: ['./course-dialog.component.css']
})
export class CourseDialogComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  course: Course;

  @ViewChild('saveButton', { static: true }) saveButton: ElementRef;
  @ViewChild('searchInput', { static: true }) searchInput: ElementRef;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CourseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) course: Course) {

    this.course = course;

    this.form = this.fb.group({
      description: [course.description, Validators.required],
      category: [course.category, Validators.required],
      releasedAt: [moment(), Validators.required],
      longDescription: [course.longDescription, Validators.required]
    });

  }

  ngOnInit() {
    this.withConcatMap();
    this.withMergeMap();
  }

  ngAfterViewInit() {
    this.withExhaustMap();
  }

  close() {
    this.dialogRef.close();
  }

  private withConcatMap(): void {
    // concatMap, is all about COMPLETION
    // with concatMap, if we care about the order of emission and subscription of inner observables, we use concatMap
    // we wait for the first observable to complete, in order to execute the next one
    // In this example, as we start typing, we first save those changes, it completes giving us back a response from the backend
    // and after that, we continue to save other stream of changes
    this.form.valueChanges.pipe(
      filter(() => this.form.valid), // filter is a RxJs opertaror which filters a stream of values given a certain condition
      concatMap((changes) => this.saveCourses$(changes))
    ).subscribe();
  }

  private withMergeMap(): void {
    // mergeMap, This operator is best used when you wish to flatten an inner observable but want to manually control the number of inner subscriptions.
    // with mergeMap, we make operations in parallel
    this.form.valueChanges.pipe(
      filter(() => this.form.valid),
      mergeMap((changes) => this.saveCourses$(changes))
    ).subscribe();
  }

  private withExhaustMap(): void {
    // the exhaustMap is an operator that IGNORES new inner observables if the current inner observable is
    // still on going (still beign processed)
    // those inner observables ignore are lost, and will only take the next new inner observable after the previous was finished
    // for this example, this function "withExhaustMap()" will be trigger when the user clicks the save button,
    // if the user wants to go crazy and start pressing the button like a madman, let say 10 times,
    // is not going to make 10 http request to the backend, probably, only 2 times, because, those new inner observables
    // are going to be ignored while the active inner observable is still beign processed, on going
    // take a look at the Network tab, and see if in reality, we are making like n http calls.... it shouldn't
    fromEvent(this.saveButton.nativeElement, 'click')
      .pipe(
        exhaustMap(() => this.saveCourses$(this.form.value))
      )
      .subscribe();
  }

  private saveCourses$(changes: any) {
    return fetch(
      `api/courses/${this.course.id}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
      headers: { 'content-type': 'application-json' }
    });
  }
}
