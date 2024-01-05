import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ResponseHTTP } from '../interfaces/response';
import { Quotation } from '../models/quotation';

@Injectable({
  providedIn: 'root',
})
export class QuotationService {
  private apiUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getAllProjectQuotations(projectId: string) {
    return this.http.get<ResponseHTTP<Quotation[]>>(
      this.apiUrl + `projects/${projectId}/quotations`
    );
  }

  getProjectQuotationOfSupplier(projectId: string, userId: string) {
    return this.http.get<ResponseHTTP<Quotation[]>>(
      this.apiUrl + `projects/${projectId}/users/${userId}/quotations`
    );
  }

  createQuotation(quotationData: any) {
    return this.http.post<ResponseHTTP<Quotation>>(
      this.apiUrl + 'quotations/',
      quotationData
    );
  }
}
