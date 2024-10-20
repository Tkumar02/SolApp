import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganiserComponent } from './organiser/organiser.component';
import { AddMemberComponent } from './add-member/add-member.component';
import { ManageMembersComponent } from './manage-members/manage-members.component';
import { AddInstrumentComponent } from './add-instrument/add-instrument.component';
import { MemberEditComponent } from './member-edit/member-edit.component';
import { InactiveMembersComponent } from './inactive-members/inactive-members.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {path:'org',component: OrganiserComponent},
  {path:'add-member', component: AddMemberComponent},
  {path:'members', component:ManageMembersComponent},
  {path:'add-instrument', component:AddInstrumentComponent},
  {path:'edit/:id', component:MemberEditComponent},
  {path:'inactive', component:InactiveMembersComponent},
  {path:'',component:HomeComponent},
  {path:'home',component:HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
