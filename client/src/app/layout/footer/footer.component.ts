import { Component } from '@angular/core';

@Component({
  selector: 'footer',
  styleUrls: [
    './footer.css'
  ],
  templateUrl: './footer.html'
})
export class FooterComponent {
  private year: number = new Date().getFullYear();
}
