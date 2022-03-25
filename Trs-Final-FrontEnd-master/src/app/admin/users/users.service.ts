import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class UsersService {
    public url = "api/users";
    constructor(public http: HttpClient) { }
    //get users 

    public getUsersUrl = "api/Users";
    getUser() {
        return this.http.get(this.getUsersUrl);
    }
} 