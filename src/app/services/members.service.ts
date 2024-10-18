import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

interface Member {
  id: string;
  name: string;
  instruments: string[];
}

@Injectable({
  providedIn: 'root'
})

export class MembersService {

  constructor(private afs: AngularFirestore) { }

  addMember(data: any): Promise<void>{
    const id = this.afs.createId();
    return this.afs.collection('members').doc(id).set({id,...data})
  }

  addInactiveMember(data:any,id:string){
    return this.afs.collection('inactiveMembers').doc(id).set({id,...data});
  }

  deleteMember(id:string): Promise<void>{
    return this.afs.collection('members').doc(id).delete();
  }

  deleteInactive(id:string){
    return this.afs.collection('inactiveMembers').doc(id).delete();
  }

  getMembers(){
    return this.afs.collection('members').valueChanges()
  }

  getMember(id:string){
    return this.afs.collection('members').doc(id).valueChanges()
  }

  getInactiveMembers(){
    return this.afs.collection('inactiveMembers').valueChanges()
  }

  updateInstruments(id:string, newInstruments:any) {
    return this.afs.collection('members').doc(id).update({instruments:newInstruments})
  }

   // Function to move document
   moveToActive(docId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Step 1: Get the document from the original collection
      this.afs.collection('inactiveMembers').doc(docId).get().subscribe(docSnapshot => {
        if (docSnapshot.exists) {
          const documentData = docSnapshot.data();
          console.log('document Data exists')
          // Step 2: Write the document to the new collection
          this.afs.collection('members').doc(docId).set(documentData)
            .then(() => {
              // Step 3: Delete the document from the original collection
              this.afs.collection('inactiveMembers').doc(docId).delete()
                .then(() => {
                  resolve();
                })
                .catch(error => reject(error));
            })
            .catch(error => reject(error));
        } else {
          reject(new Error('Document does not exist!'));
        }
      });
    });
  }

  // addInstrumentToMember(memberId: string, newInstrument: string): Observable<void> {
  //   // Get the document reference
  //   const memberRef = this.afs.collection('members').doc(memberId);
  //   console.log('hi');

  //   return new Observable<void>((observer) => {
  //     memberRef.get().subscribe((doc) => {
  //       const memberData = doc.data() as Member;

  //       const updatedInstruments = [...memberData.instruments, newInstrument];
  //       memberRef.update({ instruments: updatedInstruments }).then(() => {
  //         observer.next();
  //         observer.complete();
  //       }).catch((error) => {
  //         observer.error(error);
  //       });
  //     }, (error) => {
  //       observer.error(error);
  //     });
  //   });
  // }
}
