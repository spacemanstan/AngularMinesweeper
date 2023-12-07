import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileComponent } from '../tile/tile.component';
import { randomInt } from 'crypto';

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
  tiles: TileComponent[] = [];

  @Input() difficulty: Difficulty = Difficulty.Easy;

  x_cols = 10;
  y_rows = 10;
  mines = 10;

  constructor() {
    this.setDifficulty(this.difficulty);
  }

  setDifficulty(difficulty: Difficulty): void {
    switch (difficulty) {
      case Difficulty.Easy:
        this.x_cols = 5;
        this.y_rows = 5;
        this.mines = 5;
        break;
      case Difficulty.Medium:
        this.x_cols = 7;
        this.y_rows = 7;
        this.mines = 7;
        break;
      case Difficulty.Hard:
        this.x_cols = 10;
        this.y_rows = 10;
        this.mines = 10;
        break;
    }

    this.generateTiles();
  }

  generateTiles(): void {
    for (let tileIndex = 0; tileIndex < this.x_cols * this.y_rows; ++tileIndex) {
      const tile = new TileComponent();
      tile.isMine = false;
      tile.adjacentMines = 0;
      this.tiles.push(tile);
    }

    let placed = 0;
    do {
      const randomElement = this.tiles[Math.floor(Math.random() * this.tiles.length)];

      if (!randomElement.isMine) {
        randomElement.isMine = true;
        ++placed;
      }
    } while (placed < this.mines);
  }

  trackByTile(index: number, item: any): any {
    return index; // or return a unique identifier if available
  }
}