import {Component} from '@angular/core';
import {LayoutComponent} from './components/layout/layout.component';
import {LoadingComponent} from './components/loading/loading.component';

@Component({
  selector: 'app-root',
  imports: [ LayoutComponent, LoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'agroprodes';

}
