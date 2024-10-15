import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class MembersService {

  constructor(private afs: AngularFirestore) { }

  addMember(data: any): Promise<void>{
    const id = this.afs.createId();
    return this.afs.collection('members').doc(id).set({id,...data})
  }

  deleteMember(id:string): Promise<void>{
    return this.afs.collection('members').doc(id).delete()
  }

  getMembers(){
    return this.afs.collection('members').valueChanges()
  }
}
