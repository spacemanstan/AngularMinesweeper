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
  @Input() revealed: Boolean = false;
  @Input() isMine: Boolean = false;
  @Input() flagged: Boolean = false;
  @Input() adjacentMines: Number = 0;

  constructor() {}
}
