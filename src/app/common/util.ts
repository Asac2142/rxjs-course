import { Observable } from 'rxjs';

export function createHttpObservable(url: string) {
  return new Observable<any>((observer) => {
    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json()
        } else {
          observer.error('Error occured with status response' + response.status);
        }
      })
      .then((body) => {
        observer.next(body);
        observer.complete();
      })
      .catch((err) => observer.error(err))
  });
}

