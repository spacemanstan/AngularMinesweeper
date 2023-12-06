import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tile {
  isMine: boolean;
}

@Component({
  selector: 'app-tile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tile.component.html',
  styleUrl: './tile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TileComponent {
  // status: 'open' | 'clear' | 'flag' = 'open';
  isMine = false;
  adjacentMines = 0;

  ngOnIntit() {
    this.isMine = false;
    this.adjacentMines = 0;
  }

  constructor() {
    this.isMine = false;
    this.adjacentMines = 0;
  }
}
