import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Fintacharts {
  private URI = 'https://platform.fintacharts.com';
  private token: string | null = null;

  constructor(private http: HttpClient) {}

  async login(): Promise<void> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', 'app-cli')
      .set('username', 'r_test@fintatech.com')
      .set('password', 'kisfiz-vUnvy9-sopnyv');
    
    const res: any = await firstValueFrom(
      this.http.post(`${this.URI}/identity/realms/fintatech/protocol/openid-connect/token`, body)
    );
    this.token = res.access_token;
    console.log("login completed")
  }
  
  async getInstruments(): Promise<any[]> {
  if (!this.token) {
    await this.login();
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
  const params = {
    provider: 'oanda',
    kind: 'forex'
  };

  const res: any = await firstValueFrom(
    this.http.get(`${this.URI}/api/instruments/v1/instruments`, {
      headers,
      params
    })
  );

  //console.log("Instruments raw response:", res);
  
  return res.data;
}


  async getBars(instrumentId: string): Promise<any[]> {
    if (!this.token) {
      await this.login();
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    const params = {
      instrumentId,
      provider: 'oanda',
      interval: '1',
      periodicity: 'minute',
      barsCount: '20'
    };

    const res: any = await firstValueFrom(
      this.http.get(`${this.URI}/api/bars/v1/bars/count-back`, { headers, params })
    );

    console.log("bars obtained")

    return res.data ?? [];;
  }

  getToken() {
    return this.token;
  }
  
  
}
