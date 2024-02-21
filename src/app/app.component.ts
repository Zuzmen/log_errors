import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TabsComponent } from "./alert-widget/tabs/tabs.component";
import {AlertWidgetComponent} from "./alert-widget/alert-widget.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TabsComponent, AlertWidgetComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}
