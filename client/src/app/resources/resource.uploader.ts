import { NgZone } from '@angular/core';
import { RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';

export class ResourceUploader {

  constructor(private _zone: NgZone) {}

  public upload(url: string, files: File[], options?: RequestOptions): Observable<any> {
    let formData: FormData = new FormData(),
        xhr: XMLHttpRequest = new XMLHttpRequest();

    for (let i = 0; i < files.length; i++) {
      formData.append('uploads[]', files[i], files[i].name);
    }

    return Observable.create((observer) => {
      xhr.onreadystatechange = this.getReadyStateChangeHandler(xhr, observer);

      xhr.upload.onprogress = this.getProgressHandler(observer);

      xhr.open('POST', url, true);
      if (options) {
        options.headers.keys().forEach(key => {
          xhr.setRequestHeader(key, options.headers.get(key));
        });
      }
      xhr.send(formData);
    });
  }

  private getReadyStateChangeHandler(xhr: XMLHttpRequest, observer: any) {
    return () => {
      this._zone.run(() => {
        if (xhr.readyState === 4) {
          // Request finished and response is ready
          if (Math.floor(xhr.status / 100) === 2) {
            observer.complete();
          } else {
            observer.error(new Error(xhr.response));
          }
        }
      });
    };
  }

  private getProgressHandler(observer: any) {
    return (event) => {
      this._zone.run(() => {
        let progress = Math.round(event.loaded / event.total * 100);
        observer.next(progress);
      });
    };
  }
}
