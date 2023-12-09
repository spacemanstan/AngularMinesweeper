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

  spawnIndex = -1

  constructor() {
    this.setDifficulty(this.difficulty);
  }

  setDifficulty(difficulty: any): void {
    switch (difficulty) {
      case 'easy':
        this.x_cols = 5;
        this.y_rows = 5;
        this.mines = 3;
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

  getAdjacentTiles(tile: TileComponent): TileComponent[] {
    let tileIndex = tile.index;
    let adjacentTiles: TileComponent[] = [];

    const isTopRow = tileIndex < this.y_rows;
    const isBottomRow = tileIndex >= this.tiles.length - this.y_rows;
    const isLeftColumn = tileIndex % this.x_cols === 0;
    const isRightColumn = (tileIndex + 1) % this.x_cols === 0;

    // TOP LEFT
    if (!isTopRow && !isLeftColumn) {
      adjacentTiles.push(this.tiles[tileIndex - this.y_rows - 1]);
    }
    // TOP
    if (!isTopRow) {
      adjacentTiles.push(this.tiles[tileIndex - this.y_rows]);
    }
    // TOP RIGHT
    if (!isTopRow && !isRightColumn) {
      adjacentTiles.push(this.tiles[tileIndex - this.y_rows + 1]);
    }
    // MID LEFT
    if (!isLeftColumn) {
      adjacentTiles.push(this.tiles[tileIndex - 1]);
    }
    // MIDDLE (skipping the tile itself)
    // MID RIGHT
    if (!isRightColumn) {
      adjacentTiles.push(this.tiles[tileIndex + 1]);
    }
    // BOT LEFT
    if (!isBottomRow && !isLeftColumn) {
      adjacentTiles.push(this.tiles[tileIndex + this.y_rows - 1]);
    }
    // BOTTOM
    if (!isBottomRow) {
      adjacentTiles.push(this.tiles[tileIndex + this.y_rows]);
    }
    // BOTTOM RIGHT
    if (!isBottomRow && !isRightColumn) {
      adjacentTiles.push(this.tiles[tileIndex + this.y_rows + 1]);
    }

    return adjacentTiles;
  }

  generateTiles(): void {
    for (let tileIndex = 0; tileIndex < this.x_cols * this.y_rows; ++tileIndex) {
      const tile = new TileComponent();
      tile.setIndex(tileIndex);
      this.tiles[tileIndex] = tile;
    }

    let placed = 0;
    do {
      const randomIndex = Math.floor(Math.random() * this.tiles.length);
      const randomElement = this.tiles[randomIndex];

      if (!randomElement.isMine) {
        randomElement.isMine = true; // place mine
        ++placed; // update counter

        // inform neighbours
        const adjacentTiles = this.getAdjacentTiles(randomElement);
        for (const adjTile of adjacentTiles) {
          adjTile.adjacentMines++;
        }
      }
    } while (placed < this.mines);
  }

  checkTile(tile: TileComponent) {
    if (!tile.flagged && !tile.revealed) {
      this.revealTile(tile);
    }
  }

  revealTile(tile: TileComponent) {
    if (tile.revealed) { return };

    tile.revealed = !tile.revealed;

    if (tile.adjacentMines != 0 && !tile.isMine) { return };

    const adjacentTiles = this.getAdjacentTiles(tile);

    for (const adjTile of adjacentTiles) {
        this.revealTile(adjTile);
    }
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