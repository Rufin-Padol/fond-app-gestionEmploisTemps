import { Component, OnInit } from '@angular/core';
 
import { CommonModule } from '@angular/common';
import { LoadingComponent } from "../loading/loading.component";
import { LoadingService } from '../../core/services/loading.service';
import { NavigationEnd, NavigationStart, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, LoadingComponent,RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  

  isLoading = false;
   private minDisplayTime = 3000; // 2 secondes minimum
  private loadingStartTime!: number;
      constructor(private loadingService: LoadingService,  private router: Router){}
  ngOnInit(): void {
  // this.loadingStartTime = Date.now();

  //   // Détection du chargement initial
  
  // this.loadingService.isLoading$.subscribe(loading => {
  //     this.isLoading = loading;
  //   });
    // Gestion du chargement pendant la navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingStartTime = Date.now();
        this.loadingService.show();
      } else if (event instanceof NavigationEnd) {
        this.handleLoadingEnd();
      }
    });

    // // Pour le chargement initial
    // this.handleLoadingEnd();
  }



   private handleLoadingEnd() {
    const elapsed = Date.now() - this.loadingStartTime;
    const remainingTime = this.minDisplayTime - elapsed;

    if (remainingTime > 0) {
      setTimeout(() => {
        this.loadingService.hide();
      }, remainingTime);
    } else {
      this.loadingService.hide();
    }
  }
}

   

