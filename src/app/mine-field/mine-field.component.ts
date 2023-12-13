import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileComponent } from '../tile/tile.component';
import { fisherYatesShuffle } from './shuffle';
import { map } from './map';

@Component({
  selector: 'app-mine-field',
  standalone: true,
  imports: [CommonModule, TileComponent],
  templateUrl: './mine-field.component.html',
  styleUrl: './mine-field.component.scss'
})
export class MineFieldComponent {
  // temporary difficulty selector
  @Input() difficulty: 'easy' | 'medium' | 'hard' = 'easy';
  gameState: 'first' | 'game' | 'win' | 'lose' = 'first';

  x_cols = 10; // width of minefield
  y_rows = 10; // height of minefield
  mines = 10; // # of mines in minefield

  // tiles are stored as 1D array but rendered into 2D grid 
  tiles: TileComponent[] = [];

  showOverlay = false;

  // async tracking
  private revealIndicator: boolean = false;
  private checkIndicator: boolean = false;
  private endEffectIndicator: boolean = false;

  // long press touch tracking variables
  private clickStartTime = 0;
  private clickThreshold = 1000; // ms

  /**
   * Constructs a new MineFieldComponent instance.
   * Initializes the game based on the default or provided difficulty level upon component creation.
   * Calls the initializeGame method with the default difficulty setting.
   */
  constructor() {
    this.intializeGame(this.difficulty);
  }

  /**
   * Initializes the game with the specified difficulty level.
   * @param difficulty - The selected difficulty level: 'easy', 'medium', or 'hard'.
   * Resets all game indicators and settings, generates tiles, and sets the game state to 'first'.
   * This method serves as an entry point for starting or restarting the game.
   */
  intializeGame(difficulty: any) {
    // Interrupt any potential reveal effects and reset game indicators
    this.revealIndicator = false;
    this.endEffectIndicator = false;
    this.showOverlay = false;

    // Set the initial game state to 'first' and update the selected difficulty
    this.gameState = 'first';
    this.difficulty = difficulty;

    // Apply the chosen difficulty settings and generate new tiles
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
        this.mines = 5;
        break;
      case 'medium':
        this.x_cols = 12;
        this.y_rows = 12;
        this.mines = 15;
        break;
      case 'hard':
        this.x_cols = 15;
        this.y_rows = 15;
        this.mines = 50;
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

  /**
   * Starts a new game with the same difficulty level.
   * Stops any ongoing reveal effects or game-ending effects by setting corresponding indicators to false.
   * Initializes a new game with the same difficulty level as the current game.
   * Invokes the initializeGame method to reset the game with the same difficulty.
   */
  newGame() {
    // stop reveal by setting flag; acts like an interrupt
    this.revealIndicator = false;
    this.endEffectIndicator = false;

    // intialize new game of same difficulty
    this.intializeGame(this.difficulty);
  }

  /**
   * Retries the current game, resetting it to its initial state without changing the difficulty.
   * Stops any ongoing reveal or end game effects by setting corresponding indicators to false.
   * Waits for a short delay (10 milliseconds) to allow interruption of ongoing processes.
   * Hides the overlay, changes the game state to 'game', and resets all tiles.
   * Resets revealed and flagged states of tiles and resets mines to their default appearance if necessary.
   */
  async retryGame() {
    // stop reveal by setting flag; acts like an interrupt
    this.revealIndicator = false;
    this.endEffectIndicator = false;

    // wait for interrupt  
    await this.delay(10);

    // Hide the overlay and set the game state to 'game'
    this.showOverlay = false;
    this.gameState = 'game';

    for (const tile of this.tiles) {
      // hide everything again 
      tile.revealed = false;
      // unflag it
      tile.flagged = false;

      // reset mines
      if (tile.isMine) {
        tile.tileSVG = 'bomb';
      }
    }
  }

  /**
   * Places mines randomly on the minefield.
   * @param startIndex - Index of the first clicked tile to prevent an immediate game over.
   * Utilizes a greedy algorithm to randomly place mines until the specified number of mines is reached.
   * Updates the 'isMine' property and SVG appearance of tiles designated as mines.
   * Updates the adjacentMines count for neighboring tiles of each mine.
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
        randomElement.tileSVG = 'bomb'; // update SVG
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
   * Initiates the check or flag process based on mouse down event.
   * @param event - The mouse event triggering the check or flag.
   * @param tile - The tile to be checked or flagged.
   */
  startCheck(event: MouseEvent, tile: TileComponent) {
    event.preventDefault();

    if(this.checkIndicator) return;

    this.checkIndicator = true;

    // left click 
    if (event.button === 0) {
      this.clickStartTime = Date.now();
    }

    // right-click
    if (event.button === 2) {
      this.clickStartTime -= this.clickThreshold;
    }
  }

  /**
  * Ends the check or flag process based on mouse up event.
  * @param event - The mouse event triggering the end of the check or flag.
  * @param tile - The tile associated with the mouse event.
  */
  endCheck(event: MouseEvent, tile: TileComponent) {
    event.preventDefault();

    const clickEndTime = Date.now();
    const clickDuration = clickEndTime - this.clickStartTime;

    if(clickDuration < this.clickThreshold) {
      this.checkTile(tile);
    } else {
      this.flagTile(tile);
    }

    this.checkIndicator = false;
  }

  /**
   * Checks the state of a tile and initiates revealing if allowed.
   * @param tile - The tile to check and potentially reveal.
   * Manages various game states to prevent revealing after a game is won or lost.
   * Handles revealing tiles based on flag and reveal status and triggers win/lose conditions accordingly.
   * Updates game state and invokes necessary methods upon revealing all tiles or encountering a mine.
   */
  async checkTile(tile: TileComponent) {
    // caling this function also constitues an endCheck
    this.checkIndicator = false;
    const clickEndTime = Date.now();

    // game over means nothing to check
    if (this.gameState == 'lose' || this.gameState == 'win') {
      // if the overlay is hidden when clicking on game over, redeploy it 
      if (!this.showOverlay) this.toggleOverlay();
      return;
    }

    // first move loss prevention
    if (this.gameState == 'first') {
      // generate game on first click
      this.placeMines(tile.index);
      this.gameState = 'game';
    }

    // if not flagged or revealed, then reveal
    if (tile.flagged || tile.revealed) {
      return;
    }

    // interrupt any previous reveals just incase
    this.revealIndicator = false;

    this.revealIndicator = true;
    await this.revealTile(tile);
    this.revealIndicator = false;

    // check lose and win conditions 
    if (tile.isMine) {
      // game over - you lose ! :(
      tile.tileSVG = 'boom';
      this.gameState = 'lose';
    } else {
      let unrevealedTiles = this.tiles.filter((t) => !t.revealed && !t.isMine);
      let unexplodedMines = this.tiles.filter((t) => t.isMine && !t.revealed);

      if (unrevealedTiles.length === 0 && unexplodedMines.length === this.mines) {
        // game over - you win ! :)
        this.gameState = 'win';
      }
    }

    // if the game ended, handle end game animation sequence
    if (this.gameState == 'win' || this.gameState == 'lose') {
      this.revealAll();
      this.toggleOverlay();
      this.endGameEffect();
    }

  }

  /**
   * Asynchronous function to reveal all tiles and unflag them.
   * Stops revealing if the reveal process is interrupted.
   * Interrupted by setting revealIndicator false
   */
  async revealAll(): Promise<boolean> {
    this.revealIndicator = true;

    // reveal all and unflag
    for (const tile of this.tiles) {
      // check for interrupts and break loop 
      if (!this.revealIndicator) break;

      await this.delay(10); // small delay makes it look cooler
      tile.revealed = true;
      tile.flagged = false;
    }

    this.revealIndicator = false;
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

      // Revealing adjacent tiles asynchronously using Promise.all
      await Promise.all(adjacentTiles.map(async (adjTile) => {
        // Check for interrupts before continuing the reveal process
        if (!this.revealIndicator) return;

        // short time delay for cascade reveal effect
        await this.delay(100);

        await this.revealTile(adjTile);
      }));
    }

    return true; // completion indicator
  }

  /**
   * Initiates end-game effects based on the game outcome (win or lose).
   * @returns A promise indicating the completion of end-game effects.
   * Manages different effects for game win or loss: explosion animation for mines on loss,
   * conversion of all mines to victory signs on win.
   */
  async endGameEffect(): Promise<boolean> {
    // prevent end game effect collision, if even possible
    if (this.endEffectIndicator) return true;

    this.endEffectIndicator = true;

    // on lose, blow up mines
    if (this.gameState == 'lose') {
      // Filter out unexploded mine tiles
      const unexploded = this.tiles.filter(tile => tile.isMine && tile.tileSVG != 'boom');

      // Randomize explode order
      fisherYatesShuffle(unexploded);

      // Explode unexploded mine tiles 1 by 1 with a delay
      for (const bomb of unexploded) {
        if (!this.endEffectIndicator) break;

        await this.delay(1500);
        bomb.tileSVG = 'boom';
      }
    }

    // on win, convert everything to peace signs or hearts 
    if (this.gameState == 'win') {
      // Filter out unexploded mine tiles
      const bombs = this.tiles.filter(tile => tile.isMine);

      // ensure all bombs are bombs
      bombs.forEach((bomb) => bomb.tileSVG = 'bomb');

      // Randomize explode order
      fisherYatesShuffle(bombs);

      // Explode unexploded mine tiles 1 by 1 with a delay
      for (const bomb of bombs) {
        if (!this.endEffectIndicator) break;

        await this.delay(500);
        bomb.tileSVG = 'win';
      }
    }

    // unflag indicator 
    this.endEffectIndicator = false;

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

  /**
  * Toggles the visibility of the overlay.
  * Toggles the 'showOverlay' property to display or hide the overlay UI element.
  */
  toggleOverlay() {
    this.showOverlay = !this.showOverlay;
  }

  /**
   * Computes the background shade for a tile based on the number of adjacent mines.
   * Calculates the HSL color value representing the background shade corresponding to the number of adjacent mines.
   * @param tile - The tile for which the background shade is determined.
   * @returns A string representing the HSL color value for the tile's background shade.
   */
  getBackgroundShade(tile: TileComponent): string {
    const lightness = map(tile.adjacentMines, 0, 8, 95, 70);
    return `hsl(240, 66.666%, ${lightness}%)`;
  }
}