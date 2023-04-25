import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  production = false
  host = window.location.protocol + "//" + window.location.host;
  API_HOST: string = window.location.host.includes("localhost")
    ? "http://localhost:3001/upload/ctm/"
    : "https://magentis2.joterp.online/upload/ctm/";
  // API_URL: string = 'https://magentis2.joterp.online/api/';
  API_URL: string = !this.production && window.location.host.includes("localhost")
    ? "http://localhost:3001/api/"
    : "https://magentis2.joterp.online/api/";
  USER = localStorage.getItem("AdminData");

  constructor(private http: HttpClient) {
    console.log("ApiService", this.host);
  }

  public GetDataService(path: string) {
    const url = this.API_URL + path;
    return this.http.get(url);
  }

  public PostDataService(path: string, data: object) {
    const url = this.API_URL + path;
    return this.http.post(url, data);
  }

  public PutDataService(path: string, data: object) {
    const url = this.API_URL + path;
    return this.http.put(url, data);
  }

  public DeleteDataService(path: string, data) {
    const url = this.API_URL + path;
    return this.http.delete(url, { body: data });
  }

  public FormPostApi(path: string, data: any) {
    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      "Bearer " + JSON.parse(this.USER)?.accessToken
    );

    var requestOptions: object = {
      method: "POST",
      headers: myHeaders,
      body: data,
      redirect: "follow",
    };
    const url = this.API_URL + path;
    return fetch(url, requestOptions);
  }
}
