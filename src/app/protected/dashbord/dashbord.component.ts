import { Component, HostListener, Inject, OnInit } from '@angular/core';
 
import { LoadingService } from '../../core/services/loading.service';
import {  Router, RouterOutlet } from '@angular/router';
 
import { CommonModule } from '@angular/common';
 
import { SisbarComponent } from "./sisbar/sisbar.component";
import { AuthService } from '../../core/services/auth.service';
import { AdmingestionComponent } from "./admingestion/admingestion.component";
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { TokenService } from '../../core/services/token.service';
 

@Component({
  selector: 'app-dashbord',
  standalone: true ,
  imports: [CommonModule, RouterOutlet, SisbarComponent, AdmingestionComponent],
  templateUrl: './dashbord.component.html',
  styleUrl: './dashbord.component.css',
  animations: [
    trigger('sidebarAnimation', [
      state('void', style({ transform: 'translateX(-100%)' })),
      state('*', style({ transform: 'translateX(0)' })),
      transition('void <=> *', [
        animate('200ms ease-in-out')
      ])
    ])
  ]
})
export class DashbordComponent implements OnInit {
  isLoading = false;
   private minDisplayTime = 3000; // 2 secondes minimum
  private loadingStartTime!: number;
   sidebarOpen = false;
  notifications = 3;

  role :string | null = null;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    document.body.style.overflow = this.sidebarOpen ? 'hidden' : 'auto';
  }

      constructor(private loadingService: LoadingService,private tokenService: TokenService ,private authService :AuthService  ,private router: Router){}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth >= 1024) {
      this.sidebarOpen = true;
    } else {
      this.sidebarOpen = false;
    }
  }

  ngOnInit() {

      this.checkIfLoggedIn();
     this.getRoleUser();
     // Détection du chargement initial
    this.loadingService.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });

   
     // Gestion du chargement pendant la navigation
    // this.router.events.subscribe(event => {
    //   if (event instanceof NavigationStart) {
    //     this.loadingStartTime = Date.now();
    //     this.loadingService.show();
    //   } else if (event instanceof NavigationEnd) {
    //     this.handleLoadingEnd();
    //   }
    // });

    this.onResize(new Event('resize'));

       // Pour le chargement initial
    this.handleLoadingEnd();
  }


  getRoleUser(){
    this.role= this.authService.getRoleUser();
    console.log(  "asaddaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" ,this.role)
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

  //     isLoading = false;
  //    private minDisplayTime = 3000; // 2 secondes minimum
  //   private loadingStartTime!: number;
  //    loginForm!: FormGroup; // Déclaration sans initialisation
     
  //       constructor(private loadingService: LoadingService,  private router: Router ){}

  //   private authService =Inject(AuthService);


  //         ngOnInit(): void {
  // this.loadingStartTime = Date.now();
 
  //   // Détection du chargement initial
  //   this.loadingService.isLoading$.subscribe(loading => {
  //     this.isLoading = loading;
  //   });

  //   // Gestion du chargement pendant la navigation
  //   this.router.events.subscribe(event => {
  //     if (event instanceof NavigationStart) {
  //       this.loadingStartTime = Date.now();
  //       this.loadingService.show();
  //     } else if (event instanceof NavigationEnd) {
  //       this.handleLoadingEnd();
  //     }
  //   });

  //   // Pour le chargement initial
  //   this.handleLoadingEnd();
  // }



  //  private handleLoadingEnd() {
  //   const elapsed = Date.now() - this.loadingStartTime;
  //   const remainingTime = this.minDisplayTime - elapsed;

  //   if (remainingTime > 0) {
  //     setTimeout(() => {
  //       this.loadingService.hide();
  //     }, remainingTime);
  //   } else {
  //     this.loadingService.hide();
  //   }
  // }


 private checkIfLoggedIn(): void {
  const token = this.tokenService.getAccessToken(); // ← TokenService ici

  // Si pas de token, redirige vers login
  if (!token) {
    this.router.navigate(['/login']);
    return;
  }

  // Sinon, on vérifie que le token est toujours valide
  this.authService.getCurrentUser().subscribe({
    next: (user) => {
      this.authService.currentUser = user;
      this.getRoleUser();
    },
    error: () => {
      // Token invalide ou expiré → suppression et redirection
      this.tokenService.clearTokens(); // ← nettoie les tokens
      this.router.navigate(['/login']);
    }
  });
}


}
