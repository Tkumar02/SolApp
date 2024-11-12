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


  memberForm!: FormGroup;
  gigName: string = '';
  gigDate: Date;
  gigType: string = '';
  selectedMembers = [];

  players: any;
  showAllocateNew: boolean = false;
  confirmMembers: boolean = true;
  today: string;

  constructor(
    private ms: MembersService, 
    private toast: ToastrService,
    private is: InstrumentsService,
  ){
    const todayDate = new Date();
    this.today = todayDate.toISOString().split('T')[0]; // "YYYY-MM-DD" format
  }

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


  allocateNew(){
    if(this.gigType == ''){
      //console.log(this.gigType)
      this.toast.error('no Gig type selected')
      return;
    }
    this.players = this.allMembers.filter(member => member.selected)
    this.showAllocateNew = true;
    this.confirmMembers = !this.confirmMembers
  }    
}
