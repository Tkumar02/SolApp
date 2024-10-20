import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore'
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from '../environments/environment.prod';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OrganiserComponent } from './organiser/organiser.component';
import { AddMemberComponent } from './add-member/add-member.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ManageMembersComponent } from './manage-members/manage-members.component';
import { AddInstrumentComponent } from './add-instrument/add-instrument.component';
import { MemberEditComponent } from './member-edit/member-edit.component';
import { InactiveMembersComponent } from './inactive-members/inactive-members.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    OrganiserComponent,
    AddMemberComponent,
    NavbarComponent,
    ManageMembersComponent,
    AddInstrumentComponent,
    MemberEditComponent,
    InactiveMembersComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
  ],
  providers: [
    provideAnimations(),
    provideToastr(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
