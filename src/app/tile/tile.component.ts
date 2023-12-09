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
  @Input() revealed: boolean = false;
  @Input() isMine: boolean = false;
  @Input() flagged: boolean = false;
  @Input() adjacentMines: number = 0;

  public index: number = -1;

  constructor() {}

  setIndex(index: number): void {
    this.index = index;
  }
}
