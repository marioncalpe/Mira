import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, ActivatedRoute, Router  } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive], // on mettra MenuComponent ici après
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.sass'],
})
export class MenuComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {}

  naviguerVersCalendrier(): void {
    this.router.navigate(['/calendar'], { queryParams: { openModal: 'true' } });
  }
}
