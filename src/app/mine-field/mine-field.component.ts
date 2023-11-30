import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileComponent } from '../tile/tile.component';

enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard'
}

@Component({
  selector: 'app-mine-field',
  standalone: true,
  imports: [CommonModule, TileComponent],
  templateUrl: './mine-field.component.html',
  styleUrl: './mine-field.component.scss'
})
export class MineFieldComponent {
  @Input() difficulty: Difficulty = Difficulty.Easy;

  x_cols = 10;
  y_rows = 10;
  tiles!: any[];

  constructor() {
    this.setDifficulty(this.difficulty);
  }

  setDifficulty(difficulty: Difficulty): void {
    switch (difficulty) {
      case Difficulty.Easy:
        this.x_cols = 5;
        this.y_rows = 5;
        break;
      case Difficulty.Medium:
        this.x_cols = 10;
        this.y_rows = 10;
        break;
      case Difficulty.Hard:
        this.x_cols = 20;
        this.y_rows = 20;
        break;
      default:
        this.x_cols = 10;
        this.y_rows = 10;
        break;
    }

    this.generateTiles();
  }

  generateTiles(): void {
    this.tiles = Array(this.x_cols * this.y_rows)

    for(var index = 0; index < this.tiles.length; ++index) {
      this.tiles[index] = index;
    }
  }
}