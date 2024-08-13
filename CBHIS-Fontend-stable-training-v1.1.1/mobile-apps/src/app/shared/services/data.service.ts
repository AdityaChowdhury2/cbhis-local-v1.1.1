import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export class DataService<T> {
  constructor(
    protected url: string,
    protected http: HttpClient
  ) { }

  getAll(url: string = this.url): Observable<T[]> {
    return this.http.get<T[]>(url);
  }

  getByID(id:any, url: string = this.url): Observable<T> {
    return this.http.get<T>(url + id);
  }

  create(resource:any, url: string = this.url): Observable<any> {
    return this.http.post(url, JSON.stringify(resource),
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      });
  }

  update(resource:any): Observable<any> {
    return this.http.put(this.url, resource);
  }

  updateById(id:any, resource:any, url: string = this.url): Observable<any> {
    return this.http.put(url + id, resource);
  }

  delete(id:any): Observable<any> {
    return this.http.delete(this.url + id);
  }
}
