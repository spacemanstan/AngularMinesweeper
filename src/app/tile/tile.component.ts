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
  @Input() revealed: boolean = true;
  @Input() isMine: boolean = false;
  @Input() flagged: boolean = false;
  @Input() adjacentMines: number = 0;

  constructor() {}
}
