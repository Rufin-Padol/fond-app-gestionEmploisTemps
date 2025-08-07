import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HomeComponent } from "./public/home/home.component";
import { TokenService } from './core/services/token.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private tokenService: TokenService, private router: Router) {}

  // ngOnInit(): void {
  //   const token = this.tokenService.getAccessToken();
  //   const currentUrl = this.router.url;

  //   // Rediriger vers dashboard seulement si on n'est pas déjà dessus
  //   if (token && !currentUrl.startsWith('/dashboard') && !currentUrl.startsWith('/unauthorized')) {
  //     this.router.navigate(['/dashboard/main']);
  //   }
  // }
}