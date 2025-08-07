import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  imports: [CommonModule],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent {


   private previousUrl: string = '';

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.previousNavigation) {
      this.previousUrl = navigation.previousNavigation.finalUrl?.toString() || '';
    }
  }

  ngOnInit(): void {
    const storedPreviousUrl = localStorage.getItem('previousUrl');
    if (storedPreviousUrl) {
      this.previousUrl = storedPreviousUrl;
    }
  }

  goBack(): void {
    if (this.previousUrl && this.previousUrl !== '/404') {
      this.router.navigateByUrl(this.previousUrl);
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      this.goHome();
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
