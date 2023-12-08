import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileComponent } from '../tile/tile.component';

@Component({
  selector: 'app-mine-field',
  standalone: true,
  imports: [CommonModule, TileComponent],
  templateUrl: './mine-field.component.html',
  styleUrl: './mine-field.component.scss'
})
export class MineFieldComponent {
  tiles: TileComponent[] = [];

  @Input() difficulty: 'easy' | 'medium' | 'hard' = 'easy';

  x_cols = 10;
  y_rows = 10;
  mines = 10;

  constructor() {
    this.setDifficulty(this.difficulty);
  }

  setDifficulty(difficulty: any): void {
    switch (difficulty) {
      case 'easy':
        this.x_cols = 5;
        this.y_rows = 5;
        this.mines = 5;
        break;
      case 'medium':
        this.x_cols = 7;
        this.y_rows = 7;
        this.mines = 7;
        break;
      case 'hard':
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
      this.tiles[tileIndex] = tile;
    }

    let placed = 0;
    do {
      const randomIndex = Math.floor(Math.random() * this.tiles.length);
      const randomElement = this.tiles[randomIndex];

      if (!randomElement.isMine) {
        randomElement.isMine = true; // place mine
        ++placed; // update counter

        // update adjacent tiles to mine
        // update above tile (past first row)
        if(randomIndex >= this.y_rows) {
          this.tiles[randomIndex - this.y_rows].adjacentMines++;
        }
        // update below tile (before last row)
        if(randomIndex < this.tiles.length - this.y_rows) {
          this.tiles[randomIndex + this.y_rows].adjacentMines++;
        }
        // update left tile (all indices on right most edge % == 0)
        if(randomIndex % this.x_cols > 0) {
          this.tiles[randomIndex - 1].adjacentMines++;
        }
        // update right tile (index to right is not first column of new row)
        if ((randomIndex + 1) % this.x_cols !== 0) {
          this.tiles[randomIndex + 1].adjacentMines++;
        }
      }
    } while (placed < this.mines);
  }

  checkTile(tile: TileComponent) {
    // dont check flagged tiles
    // if (tile.flagged) { return; }

    // tile.isMine = !tile.isMine;

    tile.revealed = !tile.revealed;
  }

  flagTile(tile: TileComponent) {
    // cant flag revealed tiles
    if (tile.revealed) {
      tile.flagged = false;
      return;
    }

    // flag or unflag
    tile.flagged = !tile.flagged;
  }
}