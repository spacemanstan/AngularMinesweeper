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
  // temporary difficulty selector
  @Input() difficulty: 'easy' | 'medium' | 'hard' = 'hard';

  x_cols = 10; // width of minefield
  y_rows = 10; // height of minefield
  mines = 10; // # of mines in minefield

  // tiles are stored as 1D array but rendered into 2D grid 
  tiles: TileComponent[] = [];

  showOverlay = false;
  gameState: 'first' | 'game' | 'win' | 'lose' = 'first';

  // Track if a check is in progress
  private isChecking: boolean = false;

  constructor() {
    // intializer function temporarily
    this.intializeGame(this.difficulty);
  }

  /**
   * Intialize the game
   */
  intializeGame(difficulty: any) {
    this.showOverlay = false;
    this.gameState = 'first';
    this.difficulty = difficulty;
    this.setDifficulty(this.difficulty);
    this.generateTiles();
  }

  /**
   * Sets the difficulty level of the game and initializes tiles accordingly.
   * Temporary function until MineFieldComponent constructor is reworked for dimensions and mine parameters
   * @param difficulty - The chosen difficulty level: 'easy', 'medium', or 'hard'.
   */
  setDifficulty(difficulty: any): void {
    switch (difficulty) {
      case 'easy':
        this.x_cols = 7;
        this.y_rows = 7;
        this.mines = 10;
        break;
      case 'medium':
        this.x_cols = 12;
        this.y_rows = 12;
        this.mines = 20;
        break;
      case 'hard':
        this.x_cols = 15;
        this.y_rows = 15;
        this.mines = 45;
        break;
    }
  }

  /**
   * Generates the tiles for the minefield with random mine placement.
   */
  generateTiles(): void {
    // reset array 
    this.tiles = [];

    // intialize array with default tilecomponents, html passes default values as inputs
    for (let tileIndex = 0; tileIndex < this.x_cols * this.y_rows; ++tileIndex) {
      const tile = new TileComponent(); // create new tile
      tile.setIndex(tileIndex); // tiles know their position for easier code later
      this.tiles[tileIndex] = tile; // set index to new tile
    }
  }

  newGame() {
    this.intializeGame(this.difficulty);
  }

  retryGame() {
    // hide overlay
    this.showOverlay = false;
    // skip first move generation check
    this.gameState = 'game';

    for(const tile of this.tiles) {
      // hide everything again 
      tile.revealed = false;
      // unflag it
      tile.flagged = false;
      
      // reset mines
      if(tile.isMine) {
        tile.exploded = false;
      }
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

      if (randomIndex == startIndex) continue;

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
    if (this.gameState == 'lose' || this.gameState == 'win') return;

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
  async checkTile(tile: TileComponent) {
    if (this.gameState == 'lose' || this.gameState == 'win') return;

    // Set the flag to indicate a check is in progress
    this.isChecking = true;

    // first move loss prevention
    if (this.gameState == 'first') {
      // generate game on first click
      this.placeMines(tile.index);
      this.gameState = 'game';
    }

    // if not flagged or revealed, then reveal
    if (tile.flagged || tile.revealed) {
      this.isChecking = false;
      return
    }

    // actually reveal the tile, cascade if necessary
    const doneReveal = await this.revealTile(tile);

    if (doneReveal) {
      // game over - you lose ! :(
      if (tile.isMine) {
        tile.exploded = true;
        this.gameState = 'lose'
        this.revealAll();
        this.detonateAll();
        this.toggleOverlay();
        this.isChecking = false;
        return;
      }

      let unrevealedTiles = this.tiles.filter((t) => !t.revealed && !t.isMine);
      let unexplodedMines = this.tiles.filter((t) => t.isMine && !t.exploded);

      // dont check win condition until after reveal is done 
      if (unrevealedTiles.length === 0 && unexplodedMines.length === this.mines) {
        // game over - you win ! :)
        this.gameState = 'win';
        this.revealAll();
        this.toggleOverlay();
        this.isChecking = false;
      }
    }
  }

  async revealAll(): Promise<boolean> {
    // reveal all and unflag
    for (const tile of this.tiles) {
      await this.delay(10); // small delay makes it look cooler
      tile.revealed = true;
      tile.flagged = false;
    }

    return true; // completion indicator
  }

  async detonateAll(): Promise<boolean> {
    // Filter out unexploded mine tiles
    const unexploded = this.tiles.filter(tile => tile.isMine && !tile.exploded);

    // Randomize explode order
    fisherYatesShuffle(unexploded);

    // Explode unexploded mine tiles 1 by 1 with a delay
    for (const bomb of unexploded) {
      await this.delay(1500);
      bomb.exploded = true;
    }

    return true; // completion indicator
  }

  /**
   * Asynchronous function to reveal a tile and its adjacent tiles if they are empty.
   * Async allows for the delayed cascading effect
   * @param tile - The tile to reveal.
   */
  async revealTile(tile: TileComponent): Promise<boolean> {
    if (tile.revealed || tile.flagged) {
      return true; // completion indicator
    }

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

    return true; // completion indicator
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