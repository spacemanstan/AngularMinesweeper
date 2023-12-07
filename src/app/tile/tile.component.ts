import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tile.component.html',
  styleUrl: './tile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TileComponent {
  // @Input() status: 'concealed' | 'revealed' | 'flag' = 'concealed';
  @Input() isMine: any;
  @Input() adjacentMines: any;

  constructor() {}
}
