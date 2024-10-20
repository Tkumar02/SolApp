import { Component } from '@angular/core';
import { MembersService } from '../services/members.service';
import { ToastrService } from 'ngx-toastr';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter } from 'rxjs';
import { InstrumentsService } from '../services/instruments.service';

interface Allocation {
  name: string;
  instrument: string;
}

@Component({
  selector: 'app-organiser',
  templateUrl: './organiser.component.html',
  styleUrl: './organiser.component.css'
})

export class OrganiserComponent {

  membersAllocated: boolean = false;
  allMembers: any;
  allInstruments: any;
  selectedInstruments:Array<string> = []
  final:Array<Allocation> = []
  instrumentCount: Array<any> = []

  memberForm!: FormGroup;
  instrumentForm!: FormGroup;
  gigName: string = '';
  gigDate: Date;

  constructor(
    private ms: MembersService, 
    private toast: ToastrService,
    private fb:FormBuilder,
    private is: InstrumentsService,
  ){}

  ngOnInit(): void{
    this.ms.getMembers().subscribe(val=>{
      this.allMembers = val;
    });
    this.is.getAllInstruments().subscribe(val=>{
      this.allInstruments = val;
      this.allInstruments.forEach(item => {
        this.instrumentCount.push({instrument: item.instrument,count:0})
      })
      console.log(this.instrumentCount)
    })
    this.memberForm = this.fb.group({
      members: this.fb.array([this.createMemberGroup()])
    })
    this.instrumentForm = this.fb.group({
      instruments: this.fb.array([this.createInstrumentGroup(0)])
    })
  }

  createMemberGroup(): FormGroup {
    return this.fb.group({
      name:['', Validators.required]
    })
  }

  createInstrumentGroup(nextIndex: number): FormGroup {
    return this.fb.group({
      name:['', Validators.required],
      index: [nextIndex]
    })
  }

  increment(i:number){
    this.instrumentCount[i].count++
  }

  decrement(i:number){
    if(this.instrumentCount[i].count>0){
      this.instrumentCount[i].count--
    }
  }

  get members(): FormArray {
    return this.memberForm.get('members') as FormArray;
  }

  get instruments(): FormArray {
    return this.instrumentForm.get('instruments') as FormArray;
  }

  addMember(){
    this.members.push(this.createMemberGroup())
  }

  addInstrument(){
    const nextIndex = this.instruments.length;
    this.instruments.push(this.createInstrumentGroup(nextIndex))
  }

  onSubmit(): void {
    if(this.memberForm.valid) {
      console.log('Form Submitted', this.memberForm.value)
    }
  }

  submitInstruments(){
    console.log(this.instrumentForm.value)
  }

//   allocateMembers() {
//     const selectedMembers = this.memberForm.value.members.map(member => member.name);
//     const filteredMembers = this.allMembers.filter(member => selectedMembers.includes(member.name));
    
//     // Copy the members to ensure we can modify the list during allocation
//     let membersList = [...selectedMembers];  // CHANGE: Moved from for loop to initialization.
    
//     // Extract the list of instruments (including duplicates if any)
//     let instrumentsList = this.instrumentForm.value.instruments.map(instrument => instrument.name);  // No changes here.

//     // Outer loop goes over instruments
//     for (let instrument of instrumentsList) {  // Loop over all instruments, even if duplicated.
//         // Inner loop goes over members
//         for (let member of filteredMembers) {
//             // Check if the member can play this instrument AND is still in the membersList
//             if (member.instruments.includes(instrument) && membersList.includes(member.name)) {
//                 console.log(member.name, instrument);
                
//                 // Create the allocation object
//                 const allocation = { name: member.name, instrument: instrument };
//                 this.final.push(allocation);

//                 // Remove the allocated member from membersList
//                 membersList = membersList.filter(item => item !== member.name);  // CHANGE: Ensure that member is removed from the allocation list.
                
//                 // Move to the next instrument
//                 break;  // Still break out of the inner loop after one allocation per instrument.
//             }
//         }
//     }

//     // Flag to indicate that members have been allocated
//     this.membersAllocated = true;
//     console.log(this.final, 'FINAL');
// }


  allocateMembers(){
    const selectedMembers = this.memberForm.value.members.map(member=>member.name)
    const filteredMembers = this.allMembers.filter(member=>selectedMembers.includes(member.name))    
    let membersList = [...selectedMembers];
    let instrumentsList = this.instrumentForm.value.instruments.map(
      instrument => instrument.name);

    
    for(let instrument of instrumentsList){
      for(let member of filteredMembers){
        if(member.instruments.includes(instrument) && membersList.includes(member.name)){
          console.log(member.name,instrument)
          const allocation = { name: member.name, instrument: instrument };
          this.final.push(allocation)
          membersList = membersList.filter(item=>item!=member.name);
          break;
        }
      }
    }
    

    this.membersAllocated = true;
    console.log(this.final,'FINAL')
  }

  // onMemberSelected(i:number){
  //   const name = this.memberForm.value.members[i].name
  //   const index = this.allNames.indexOf(name)
  //   this.allNames.splice(index,1)
  // }

//   allocateMembers(){
//     const selectedMembers = this.memberForm.value.members.map(member=>member.name)
//     const filteredMembers = this.allMembers.filter(member=>selectedMembers.includes(member.name))
//     console.log(filteredMembers,'filtered members')
//     let membersList = []
//     console.log(filteredMembers,'selected members')
//     for(let member of filteredMembers){
//       console.log(member.instruments,'member instruments',member.name, 'names')
//     }
//     for(let member of selectedMembers){
//       membersList.push(member)
//     }
//     console.log('check here', membersList)
//     console.log(selectedMembers,'selected members, at the end')
//     while(membersList.length>0){
//       for(let member of filteredMembers){
//         if(member.instruments.includes('Marking') && membersList.includes(member.name)){
//           console.log(member.name,'WORKS!!!!')
//           this.markingI.push(member.name);
//           membersList = membersList.filter(item=>item!=member.name);
//           break;
//         }
//       }
//       for(let member of filteredMembers){
//         if(member.instruments.includes('Rep') && membersList.includes(member.name)){
//           this.repI.push(member.name);
//           membersList = membersList.filter(item=>item!=member.name);
//           break;
//         }
//       }
//       for(let member of filteredMembers){
//         if(member.instruments.includes('Roller') && membersList.includes(member.name)){
//           this.rollerI.push(member.name);
//           membersList = membersList.filter(item=>item!=member.name);
//           break;
//         }
//       }
//       for(let member of filteredMembers){
//         if(member.instruments.includes('Timbal') && membersList.includes(member.name)){
//           this.timbalI.push(member.name);
//           membersList = membersList.filter(item=>item!=member.name);
//           break;
//         }
//       }
//       for(let member of filteredMembers){
//         if(member.instruments.includes('Caixa') && membersList.includes(member.name)){
//           this.caixaI.push(member.name);
//           membersList = membersList.filter(item=>item!=member.name);
//           break;
//         }
//       }
//       for(let member of filteredMembers){
//         if(member.instruments.includes('Third') && membersList.includes(member.name)){
//           this.thirdI.push(member.name);
//           membersList = membersList.filter(item=>item!=member.name);
//           break;
//         }
//       }
//       for(let member of filteredMembers){
//         if(member.instruments.includes('Shaker') && membersList.includes(member.name)){
//           this.shakerI.push(member.name);
//           membersList = membersList.filter(item=>item!=member.name);
//           break;
//         }
//       }
//     }
//     console.log(membersList,'membersList')
//     this.membersAllocated = true;
//   }
}
