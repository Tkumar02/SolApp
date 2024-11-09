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

interface Person {
  name: string;
  instruments: string[];
}

@Component({
  selector: 'app-organiser',
  templateUrl: './organiser.component.html',
  styleUrl: './organiser.component.css'
})

export class OrganiserComponent {

  allMembers: any;
  allInstruments: any;

  rollerPlayersCount: number = 0; // Number of allocated roller players
  thirdCount: number = 0; // Number of allocated thirds


  memberForm!: FormGroup;
  gigName: string = '';
  gigDate: Date;
  gigType: string = '';
  selectedMembers = [];
  final: Array<Allocation> = [];

  constructor(
    private ms: MembersService, 
    private toast: ToastrService,
    private is: InstrumentsService,
  ){}

  ngOnInit(): void{
    this.ms.getMembers().subscribe(val=>{
      this.allMembers = val;
      this.allMembers.sort((a, b) => a.name.localeCompare(b.name));
      this.allMembers.forEach(member=> {
        member.instruments = member.instruments.filter(instrument=>instrument !== null && instrument !== '')
      })
    });
    this.is.getAllInstruments().subscribe(val=>{
      this.allInstruments = val;
    })
  }

  toggleMemberSelection(member) {
    member.selected = !member.selected; // Toggle the selected state
    //console.log(`${member.name} selected: ${member.selected}`);
  }

  submitSelection(){
    this.selectedMembers = this.allMembers
      .filter(member => member.selected)
      .map(member=>member.name);
    //console.log('Selected members:', this.selectedMembers);
  }

  checkGig(){
    //console.log(this.gigType)
  }

  allocateMembers(){
    if(this.gigType == ''){
      //console.log(this.gigType)
      this.toast.error('no Gig type selected')
      return;
    }
    this.final = [];
    const gigMembers = this.allMembers.filter(member => member.selected)
    let members = this.allMembers.map(member=>member.name)
    const instruments = this.allInstruments.map(instrument => instrument.instrument)

    //1. Assign anyone who only plays one instrument 
    for(let member of gigMembers){
      //console.log(member.name,member.instruments, member.instruments.length)
      if(member.instruments.length==1){
        let obj = {name:'',instrument:''}
        obj.name = member.name
        obj.instrument = member.instruments[0]
        this.final.push(obj)
        members = members.filter(name=>name!==member.name)
      }
    }
    
    //2. Assign Rep-Leader if not already assigned
    const checkRepLeader = this.final.some(member => member.instrument.includes('Rep-Leader'))
    for(let member of gigMembers){
      if(member.instruments.includes('Rep-Leader')&&members.includes(member.name) && !checkRepLeader){
        let obj = {name:'',instrument:'Rep-Leader'}
        obj.name = member.name;
        this.final.push(obj);
        members = members.filter(name=>name!==member.name)
        break;
      }
    }

    //3. Assign Marking and check if anyone has already been assigned marking
    let markCount = 4
    for(let obj of this.final){
      if(obj.instrument=='Marking'){
        markCount--
      }
    }
    if(gigMembers.length>=20 && this.gigType=='Procession'){
      for(let member of gigMembers){
        if(member.instruments.includes('Marking')&& members.includes(member.name)&&markCount>0){
          let obj = {name:'',instrument:'Marking'}
          obj.name = member.name
          this.final.push(obj)
          members = members.filter(name=>name!==member.name)
          markCount--
        }
      }
    }
    if((gigMembers.length>=20 && this.gigType=='Standing') || (gigMembers.length<20 && this.gigType=='Procession')){
      for(let member of gigMembers){
        if(member.instruments.includes('Marking')&& members.includes(member.name)&&markCount>2){
          let obj = {name:'',instrument:'Marking'}
          obj.name = member.name
          this.final.push(obj)
          members = members.filter(name=>name!==member.name)
          markCount--
        }
      }
    }

    //4. Check what is the lowest number of instruments that are known to the members
    const instList =['Roller','Timbal','Caixa','Rep','Third']

    const instrumentAllocations: Record<string, string[]> = {};
    const personAllocated: Record<string, boolean> = {};
    const maxPlayersPerInstrument = Math.ceil(members.length / instList.length);

    // Step 1: Build preference lists for each allowed instrument
    const instrumentPreferences: Record<string, { name: string; rank: number }[]> = {};

    gigMembers.forEach(person => {
      if (members.includes(person.name)) { // Only consider unallocated members
        personAllocated[person.name] = false;
        person.instruments.forEach((instrument, index) => {
          if (instList.includes(instrument)) {
            if (!instrumentPreferences[instrument]) {
              instrumentPreferences[instrument] = [];
            }
            instrumentPreferences[instrument].push({ name: person.name, rank: index });
          }
        });
      }
    });

    // Sort each instrument's player list by preference rank
    for (const instrument in instrumentPreferences) {
      instrumentPreferences[instrument].sort((a, b) => a.rank - b.rank);
    }

    // Step 2: Allocate each person to their highest preferred instrument
    for (const instrument of instList) {
      instrumentAllocations[instrument] = [];
      for (const { name } of instrumentPreferences[instrument] || []) {
        if (
          !personAllocated[name] &&
          instrumentAllocations[instrument].length < maxPlayersPerInstrument
        ) {
          // Check for the roller rule: for every 3 roller players, we need at least 1 third
          if (instrument === 'roller') {
            if (this.rollerPlayersCount - (this.thirdCount * 3) >= 3) {
              // If there are 3 roller players for every third, we skip adding more roller players
              continue;
            }
            this.rollerPlayersCount++;
          } else if (instrument === 'drums') {
            this.thirdCount++;
          }

          instrumentAllocations[instrument].push(name);
          members = members.filter(memberName => memberName !== name); // Remove from membersName
          personAllocated[name] = true;
          
          // Add allocation to finalArray in the desired format
          this.final.push({ name, instrument });
        }
      }
    }

    // Step 3: Handle unallocated people by trying to find them an available spot
  gigMembers.forEach(person => {
      if (!personAllocated[person.name] && members.includes(person.name)) {
        for (const instrument of person.instruments) {
          if (
            instList.includes(instrument) &&
            instrumentAllocations[instrument].length < maxPlayersPerInstrument
          ) {
            // Check for the roller rule: for every 3 roller players, we need at least 1 third
            if (instrument === 'Roller') {
              if (this.rollerPlayersCount - (this.thirdCount * 3) >= 3) {
                // If there are 3 roller players for every third, we skip adding more roller players
                continue;
              }
              this.rollerPlayersCount++;
            } else if (instrument === 'Third') {
              this.thirdCount++;
            }

            instrumentAllocations[instrument].push(person.name);
            members = members.filter(memberName => memberName !== person.name); // Remove from membersName
            personAllocated[person.name] = true;

            // Add allocation to finalArray in the desired format
            this.final.push({ name: person.name, instrument:instrument });
            break;
          }
        }
      }
    });
  }
}
