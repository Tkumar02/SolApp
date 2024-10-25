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

  allMembers: any;
  allInstruments: any;

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
    for(let member of gigMembers){
      //console.log(member.instruments, member.instruments.length)
      if(member.instruments.length==1){
        let obj = {name:'',instrument:''}
        obj.name = member.name
        obj.instrument = member.instruments[0]
        this.final.push(obj)
        members = members.filter(name=>name!==member.name)
      }
    }
    let countRep = 0;
    for(let member of gigMembers){
      if(member.instruments.includes('Rep-Leader')&&countRep==0&&members.includes(member.name)){
        let obj = {name:'',instrument:'Rep-Leader'}
        obj.name = member.name;
        this.final.push(obj);
        members = members.filter(name=>name!==member.name)
        countRep++
        //console.log(countRep)
      }
    }
    let markCount = 3
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
    if(gigMembers.length>=20 && this.gigType=='Standing'){
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
    let rollersCount = [];
    let thirdCount = [];
    let bothCount = [];
    for(let member of gigMembers){
      if(member.instruments.includes('Third') && member.instruments.includes('Roller') && members.includes(member.name)){
        bothCount.push(member.name)
        console.log(member.name,'both')
      }
      else if(member.instruments.includes('Roller') && members.includes(member.name)){
        rollersCount.push(member.name)
        console.log(member.name,'Roller')
      }
      else if(member.instruments.includes('Third') && members.includes(member.name)){
        thirdCount.push(member.name)
      }
    }
    switch(thirdCount.length){
      case 0:
        if(bothCount.length>0 && rollersCount.length>bothCount.length){
          let n = rollersCount.length/bothCount.length
          
        }
        break;
      case 1:
    }
    const n = rollersCount.length / thirdCount.length
    console.log(n)
    for(let i=0;i++;i<n+1){
      console.log('final Thirds: ',thirdCount[i])
    }

    const newIList =['Roller','Timbal','Caixa','Rep']
    for(let member of gigMembers){
      for(let instrument of newIList){
        if(members.includes(member.name) && member.instruments.includes(instrument)){
          let obj = {name:'',instrument:''}
          obj.name = member.name
          obj.instrument = instrument
          this.final.push(obj)
          members = members.filter(name=>name!==member.name)
          //console.log(members)
        }
      }
    }
    //console.log(this.final)
  }

  // allocateMembers(){
  //   const gigMembers = this.allMembers.filter(member => member.selected)
  //   let members = this.allMembers.map(member=>member.name)
  //   console.log(members)
  //   const instruments = this.allInstruments.map(instrument => instrument.instrument)
  //   gigMembers.sort((a, b) => a.instruments.length - b.instruments.length);
  //   for(let member of gigMembers){
  //     for(let instrument of instruments){
  //       if(member.instruments.includes(instrument) && members.includes(member.name)){
  //         let obj = {name:'',instrument:''}
  //         obj.name = member.name
  //         obj.instrument = instrument
  //         this.final.push(obj)
  //         members = members.filter(name=>name!==member.name)
  //       }
  //     }
  //   }
  //   console.log(this.final, 'final')
  // }
}
