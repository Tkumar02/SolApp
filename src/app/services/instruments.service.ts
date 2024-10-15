import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class InstrumentsService {

  constructor(private afs: AngularFirestore) { }

  addInstrument(instrument:string): Promise<void>{
    const id = this.afs.createId();
    return this.afs.collection('instruments').doc(id).set({id,instrument})
  }

  deleteInstrument(id:string):Promise<void>{
    return this.afs.collection('instruments').doc(id).delete()
  }

  getAllInstruments(){
    return this.afs.collection('instruments').valueChanges()
  }
}
