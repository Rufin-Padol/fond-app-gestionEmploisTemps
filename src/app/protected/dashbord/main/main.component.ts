import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EtablissementServiceService } from '../../../core/services/etablissement-service.service';
import { EtablissementServiceUserService } from '../../../core/services/etablissement-service-user.service';
import { EtablissementDto } from '../../../core/model/models';

@Component({
  selector: 'app-main',
  imports: [RouterLink],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {

  constructor(private authService :AuthService, private etablisessementService:EtablissementServiceUserService){}
  ngOnInit(): void {
    this.loadRoleUser();
    this.loadEtablissement();
  }

  role :string | null = null;


  loadRoleUser(){
    this.role = this.authService.getRoleUser();
  }


  etablissement:EtablissementDto|null = null ;

    loadEtablissement(): void {
    
      this.etablisessementService.getEtablissementParId(this.authService.getIdEtablessement()).subscribe({
      next: (response:EtablissementDto) => {
        this.etablissement = response;
         console.log(  this.etablissement);
      },
      error: (error: any) => {
         console.log(error);
      }
    });

   
  }

}
