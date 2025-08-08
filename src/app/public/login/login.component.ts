import { Component, Inject } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
 

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse, User } from '../../core/model/user.model';
import { TokenService } from '../../core/services/token.service';
import { LoadingComponent } from "../loading/loading.component";

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  showPassword = false;

    isLoading1 = false;
    isLoading = false;
     private minDisplayTime = 3000; // 2 secondes minimum
    private loadingStartTime!: number;
     loginForm!: FormGroup; // Déclaration sans initialisation
error:string |any;
     
        constructor(private loadingService: LoadingService,  private router: Router ,
    private fb: FormBuilder, private authService: AuthService,private tokenService: TokenService){}

    // private authService =Inject(AuthService);
    // private tokenService =Inject(TokenService);


          ngOnInit(): void {
  this.loadingStartTime = Date.now();
 this.initializeForm();
    // Détection du chargement initial
    this.loadingService.isLoading$.subscribe(loading => {
      this.isLoading = loading;
    });

    // Vérifie si déjà connecté
  this.checkIfLoggedIn();

 // Gestion du chargement pendant la navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingStartTime = Date.now();
        this.loadingService.show();
      } else if (event instanceof NavigationEnd) {
        this.handleLoadingEnd();
      }
    });

    // Pour le chargement initial
    this.handleLoadingEnd();
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


  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

 

 onSubmit() {

  if (this.loginForm.valid) {
    const { email, password } = this.loginForm.value;
     this.isLoading1 = true; // 👈 Active le spinner

    this.authService.login({ username: email, password }).subscribe({
      next: (response :AuthResponse ) => {
        // Sauvegarder les tokens via le service
        this.tokenService.saveTokens(response);
        
        this.isLoading1 = false; // 👈 Désactive le spinner
          this.UserConnect();
        
           
          
      },
      error: (err:any) => {
        this.error = err.error.message ;
        this.isLoading1 = false; // 👈 Désactive le spinner
        // setTimeout(()=>{
        //    this.error= null;
        // },5000)
        // console.error('Login échoué :', err);
        // Affiche une erreur utilisateur ici si tu veux (toast, message, etc.)
      }
    });
  }
}



UserConnect(){

  this.authService.getCurrentUser().subscribe({
    next :(response :User)=>{
         console.log('get user   :', response);
        this.authService.currentUser = response;
        
     localStorage.setItem("idEtablissement",String(response.etablissementId || 0) );
     localStorage.setItem("currentUser",String(response.id) );
     localStorage.setItem("RoleUser",String(response.role) );
        
       
         this.router.navigate(['/dashboard']);
    },
    error : (error)=>{
           console.error('get user échoué :', error);
    }
  })
}

  // loginWithGoogle() {
  //   this.authService.googleLogin().subscribe({
  //     next: (response:any) => {
  //       localStorage.setItem('token', response.token);
  //       this.router.navigate(['/dashboard']);
  //     }
  //   });
  // }


  private checkIfLoggedIn(): void {
  // Vérifie la présence du token d'accès en localStorage (ou via TokenService)
  const token = this.tokenService.getAccessToken();
  if (!token) return; // pas connecté, ne rien faire

  // Tente de récupérer les infos utilisateur
  this.authService.getCurrentUser().subscribe({
    next: (user: User) => {
      this.authService.currentUser = user;
      this.router.navigate(['/dashboard']);
    },
    error: () => {
      // Token invalide ou expiré : ne rien faire, laisser sur login
    }
  });
}
}
