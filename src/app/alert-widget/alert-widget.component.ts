import { Component } from '@angular/core';
import { TabsComponent } from "./tabs/tabs.component";

@Component({
  selector: 'app-alert-widget',
  standalone: true,
    imports: [
        TabsComponent
    ],
  templateUrl: './alert-widget.component.html',
  styleUrl: './alert-widget.component.css'
})
export class AlertWidgetComponent {
  public mainHeader: string = 'Detect Multiple Failed Login';
}
