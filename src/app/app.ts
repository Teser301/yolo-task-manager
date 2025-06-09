import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Modal } from "./components/modal/modal";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, Modal],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'yolo-task-manager';

}
