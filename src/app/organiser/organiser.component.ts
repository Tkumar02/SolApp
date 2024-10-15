import { Component } from '@angular/core';
import { MembersService } from '../services/members.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-organiser',
  templateUrl: './organiser.component.html',
  styleUrl: './organiser.component.css'
})
export class OrganiserComponent {
  members = [
      {'name':'John','instruments':['marking','roller','rep']},
      {'name':'Bernie','instruments':['marking','roller','third','rep']},
      {'name':'Mark','instruments':['marking','roller','third','timbal']},
      {'name':'Mary','instruments':['marking']},
      {'name':'Casper','instruments':['rep','roller','repLeader']},
      {'name':'Colin','instruments':['caixa','roller']},
      {'name':'Carey','instruments':['rep','third']},
      {'name':'Kalinda','instruments':['third']},
      {'name':'Rob','instruments':['third','marking','roller','caixa','third','timbal','repLeader']},
      {'name':'Francesca','instruments':['timbal']},
  ];

  rollerI: Array<string> = [];
  markingI: Array<string> = [];
  repI: Array<string> = [];
  repLeaderI: Array<string> = [];
  caixaI: Array<string> = [];
  timbalI: Array<string> = [];
  shakerI: Array<string> = [];
  thirdI: Array<string> = [];

  membersAllocated: boolean = false;
  existingMembers: any;

  constructor(private ms: MembersService, private toast: ToastrService){}

  ngOnInit(): void{
    this.ms.getMembers().subscribe(val=>{
      this.existingMembers = val;
      //console.log(this.existingMembers[0])
    });
  }


  allocateMembers(){
    let membersList = []
    for(let member of this.members){
      membersList.push(member.name)
    }
    while(membersList.length>0){
      for(let member of this.members){
        if(member.instruments.includes('marking') && membersList.includes(member.name)){
          this.markingI.push(member.name);
          membersList = membersList.filter(item=>item!=member.name);
          break;
        }
      }
      for(let member of this.members){
        if(member.instruments.includes('rep') && membersList.includes(member.name)){
          this.repI.push(member.name);
          membersList = membersList.filter(item=>item!=member.name);
          break;
        }
      }
      for(let member of this.members){
        if(member.instruments.includes('roller') && membersList.includes(member.name)){
          this.rollerI.push(member.name);
          membersList = membersList.filter(item=>item!=member.name);
          break;
        }
      }
      for(let member of this.members){
        if(member.instruments.includes('timbal') && membersList.includes(member.name)){
          this.timbalI.push(member.name);
          membersList = membersList.filter(item=>item!=member.name);
          break;
        }
      }
      for(let member of this.members){
        if(member.instruments.includes('caixa') && membersList.includes(member.name)){
          this.caixaI.push(member.name);
          membersList = membersList.filter(item=>item!=member.name);
          break;
        }
      }
      for(let member of this.members){
        if(member.instruments.includes('third') && membersList.includes(member.name)){
          this.thirdI.push(member.name);
          membersList = membersList.filter(item=>item!=member.name);
          break;
        }
      }
      for(let member of this.members){
        if(member.instruments.includes('shaker') && membersList.includes(member.name)){
          this.shakerI.push(member.name);
          membersList = membersList.filter(item=>item!=member.name);
          break;
        }
      }
    }
    console.log(membersList)
    this.membersAllocated = true;
  }
}
