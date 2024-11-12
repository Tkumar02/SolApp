import { Injectable } from '@angular/core';
import { AngularFireAction } from '@angular/fire/compat/database';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class GigsService {

  constructor(
    private afs: AngularFirestore,
  ) { }

  addGig(data:any){
    const id = this.afs.createId();
    return this.afs.collection('gigs').doc(id).set({id,...data})
  }

  getGigs(){
    return this.afs.collection('gigs').valueChanges()
  }

  deleteGig(id:string){
    return this.afs.collection('gigs').doc(id).delete()
  }
}
