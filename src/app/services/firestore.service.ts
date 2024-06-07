import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  usersCollectionReference: any;
  users: Observable<any>;
  usersList: any = [];

  constructor(
    private angularFirestore: AngularFirestore,
    private angularFireStorage: AngularFireStorage
  ) {
    this.usersCollectionReference = this.angularFirestore.collection<any>('managedUsers');
    this.users = this.usersCollectionReference.valueChanges({ idField: 'id' });
    this.getUsers().subscribe((users) => {
      this.usersList = users;
    });
  }

  addUser(user: any) {
    this.usersCollectionReference.add({ ...user });
  }

  getUsers() {
    return this.users;
  }
}
