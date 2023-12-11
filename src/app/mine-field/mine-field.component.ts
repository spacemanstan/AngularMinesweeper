import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileComponent } from '../tile/tile.component';
// allowImportingTsExtensions must be enabled for this
import { fisherYatesShuffle } from './shuffle';

@Component({
  selector: 'app-mine-field',
  standalone: true,
  imports: [CommonModule, TileComponent],
  templateUrl: './mine-field.component.html',
  styleUrl: './mine-field.component.scss'
})
export class MineFieldComponent {
  // tiles are stored as 1D array but rendered into 2D grid 
  tiles: TileComponent[] = [];

  // temporary difficulty selector
  @Input() difficulty: 'easy' | 'medium' | 'hard' = 'hard';

  x_cols = 10; // width of minefield
  y_rows = 10; // height of minefield
  mines = 10; // # of mines in minefield

  showOverlay = false;
  
  gameState: 'first' | 'game' | 'win' | 'lose' = 'first';

  constructor() {
    // intializer function temporarily
    this.setDifficulty(this.difficulty);
  }

  /**
   * Sets the difficulty level of the game and initializes tiles accordingly.
   * Temporary function until MineFieldComponent constructor is reworked for dimensions and mine parameters
   * @param difficulty - The chosen difficulty level: 'easy', 'medium', or 'hard'.
   */
  setDifficulty(difficulty: any): void {
    switch (difficulty) {
      case 'easy':
        this.x_cols = 6;
        this.y_rows = 6;
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

  /**
   * Generates the tiles for the minefield with random mine placement.
   */
  generateTiles(): void {
    // intialize array with default tilecomponents, html passes default values as inputs
    for (let tileIndex = 0; tileIndex < this.x_cols * this.y_rows; ++tileIndex) {
      const tile = new TileComponent(); // create new tile
      tile.setIndex(tileIndex); // tiles know their position for easier code later
      this.tiles[tileIndex] = tile; // set index to new tile
    }
  }

  /**
   * random mine placement.
   * @param startIndex - index of first tile clicked to prevent first click game over
   */
  placeMines(startIndex: number): void {
    // greedy algorithm, randomly try to place mines until all are placed
    let placed = 0;
    do {
      const randomIndex = Math.floor(Math.random() * this.tiles.length);
      
      if(randomIndex == startIndex) continue;
      
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

  /**
  * build array of 8 potential adjacent tiles to provided tile
  * @param tile - The tile for which adjacent tiles are retrieved.
  * @returns An array of adjacent TileComponent instances.
  */
  getAdjacentTiles(tile: TileComponent): TileComponent[] {
    let tileIndex = tile.index;
    let adjacentTiles: TileComponent[] = [];

    // conditions to check adjacency for a 1d array holding 2d rendered items
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

  /**
   * Toggles flag on a unrevelaed tile, preventing future revealing
   * @param tile - The tile to flag or unflag.
   */
  flagTile(tile: TileComponent) {
    // cant flag revealed tiles
    if (tile.revealed) {
      tile.flagged = false;
      return;
    }

    // flag or unflag
    tile.flagged = !tile.flagged;
  }

  /**
   * Checks a tile's state and initiate revealing if not flagged or revealed already.
   * @param tile - The tile to check and reveal if allowed.
   */
  checkTile(tile: TileComponent) {
    if(this.gameState == 'first') {
      this.placeMines(tile.index);
      this.gameState = 'game';
    }

    // if not flagged or revealed, then reveal
    if (tile.flagged || tile.revealed) { return }

    this.revealTile(tile);

    if (tile.isMine) {
      tile.exploded = true;

      this.endGame();
    }
  }

  async endGame() {
    // reveal all and unflag
    for (const tile of this.tiles) {
      await this.delay(10); // small delay makes it look cooler
      tile.revealed = true;
      tile.flagged = false;
    }

    // slowly explode other bombs 
    let unexploded: TileComponent[] = [];

    for (const tile of this.tiles) {
      if (tile.isMine && !tile.exploded) {
        unexploded.push(tile);
      }
    }

    // randomize explode order
    fisherYatesShuffle(unexploded);

    for (const bomb of unexploded) {
      await this.delay(1500);
      bomb.exploded = true;
    }
  }

  /**
   * Asynchronous function to reveal a tile and its adjacent tiles if they are empty.
   * Async allows for the delayed cascading effect
   * @param tile - The tile to reveal.
   */
  async revealTile(tile: TileComponent) {
    if (tile.revealed || tile.flagged) { return; }

    tile.revealed = true;

    if (tile.adjacentMines === 0) {
      const adjacentTiles = this.getAdjacentTiles(tile);

      // short time delay for cascade reveal effect
      await this.delay(100);

      // Revealing adjacent tiles asynchronously using Promise.all
      await Promise.all(adjacentTiles.map(async (adjTile) => {
        // await this.delay(100);
        await this.revealTile(adjTile);
      }));
    }
  }

  /**
   * Creates a delay for a specified time using setTimeout.
   * @param ms - The delay time in milliseconds.
   * @returns A promise that resolves after the delay.
   */
  delay(ms: number): Promise<void> {
    // Create and return a Promise that resolves after specified time
    return new Promise<void>((resolve) => {
      // setTimeout simulates delay, schedules the 'resolve' function to be called after 'ms' milliseconds.
      setTimeout(resolve, ms);
    });
  }

  toggleOverlay() {
    this.showOverlay = !this.showOverlay;
  }
}