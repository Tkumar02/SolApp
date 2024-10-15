import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganiserComponent } from './organiser/organiser.component';
import { AddMemberComponent } from './add-member/add-member.component';
import { ManageMembersComponent } from './manage-members/manage-members.component';
import { AddInstrumentComponent } from './add-instrument/add-instrument.component';

const routes: Routes = [
  {path:'org',component: OrganiserComponent},
  {path:'add-member', component: AddMemberComponent},
  {path:'members', component:ManageMembersComponent},
  {path:'add-instrument', component:AddInstrumentComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
