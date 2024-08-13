import { Injectable } from '@angular/core';
import { DataService } from 'src/app/shared/services/data.service';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/app/shared/models/api-response';
import { environment } from 'src/environments/environment';
import { Registration } from '../models/registration';

@Injectable({
  providedIn: 'root',
})
export class AccountService extends DataService<Registration> {
  constructor(http: HttpClient) {
    super(environment.baseUrl, http);
  }

  registration(resource: Registration): Observable<ApiResponse> {
    return this.create(resource, `${this.url}user-account`);
  }
}
