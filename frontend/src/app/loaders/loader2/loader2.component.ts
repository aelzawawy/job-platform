import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader2',
  templateUrl: './loader2.component.html',
  styleUrls: ['./loader2.component.scss'],
})
export class Loader2Component {
  @Input() loader_posetion: string = '';
}
