import React from 'react';
import logo from './logo.svg';
import './App.css';

class ConwayGameOfLifeGame extends React.Component {
    constructor(props) {
        super(props);

        const templateMap = {
            'oscillating': [
                ['x', 'x', ' ', ' '],
                ['x', 'x', ' ', ' '],
                [' ', ' ', 'x', 'x'],
                [' ', ' ', 'x', 'x'],
            ],
        };

        this.state = {
            grid: this.convertPrettyTemplateToObject(templateMap[props.template]),
            width: props.width,
            height: props.height,
            interval: null,
            isGameRunning: false,
            currentStep: 0,
            stepsPerSecond: props.stepsPerSecond,
            template: props.template,
        };
    }

    /**
     * Converts a pretty template (see constructor) into a more machine readable
     * format.
     */
    convertPrettyTemplateToObject(prettyTemplate) {
        let templateObject = [];

        for (let y = 0; y < prettyTemplate.length; y++) {
            let row = [];
            for (let x = 0; x < prettyTemplate[y].length; x++) {
                row.push({ticked: prettyTemplate[y][x] === 'x'});
            }

            templateObject.push(row);
        }

        return templateObject;
    }

    /**
     * Creates a grid with no squares ticked.
     * @param  {int} width  Grid width
     * @param  {int} height Grid height
     * @return {array[]}
     */
    createGrid(width, height) {
        let grid = [];
        for (let y = 0; y < height; y++) {
            let row = [];
            for (let x = 0; x < width; x++) {
                row.push({ticked: false});
            }

            grid.push(row);
        }

        return grid;
    }

    /**
     * Increments the grid to the next step.
     * @return {void}
     */
    incrementStep() {
        this.setState({
            grid: this.getIncrementedGrid(this.state.grid),
            currentStep: this.state.currentStep + 1,
        });
    }

    /**
     * Return true if the cell is in range of the board.
     * @return {Boolean}
     */
    isCellInRange(x, y) {
        return x >= 0
            && x < this.state.width
            && y >= 0
            && y < this.state.height;
    }

    /**
     * Get the ticked status of a cell for the next step.
     * @param  {array[]} grid The grid of the current step
     * @param  {int} x The x position of the cell
     * @param  {int} y The y position of the cell
     * @return {boolean} The ticked status for the next step
     */
    getIncrementedCell(grid, x, y) {
        let neighbourCount = 0
            + ((this.isCellInRange(x - 1, y - 1) && grid[y - 1][x - 1].ticked) ? 1 : 0)
            + ((this.isCellInRange(x - 1, y)     && grid[y][x - 1].ticked)     ? 1 : 0)
            + ((this.isCellInRange(x - 1, y + 1) && grid[y + 1][x - 1].ticked) ? 1 : 0)
            + ((this.isCellInRange(x, y - 1)     && grid[y - 1][x].ticked)     ? 1 : 0)
            + ((this.isCellInRange(x, y + 1)     && grid[y + 1][x].ticked)     ? 1 : 0)
            + ((this.isCellInRange(x + 1, y - 1) && grid[y - 1][x + 1].ticked) ? 1 : 0)
            + ((this.isCellInRange(x + 1, y)     && grid[y][x + 1].ticked)     ? 1 : 0)
            + ((this.isCellInRange(x + 1, y + 1) && grid[y + 1][x + 1].ticked) ? 1 : 0);

        // Any ticked cell with fewer than two ticked neighbours gets unticked.
        // Any ticked cell with two or three ticked neighbours remains ticked.
        // Any ticked cell with more than three ticked neighbours gets unticked.
        if (grid[y][x].ticked) {
            return neighbourCount === 2 || neighbourCount === 3;
        } else {
            // Any unticked cell with three neighbours will be ticked.
            return neighbourCount === 3;
        }
    }

    /**
     * Provides the grid for the next step.
     * @param  {array[]} grid The grid of the current step
     * @return {array[]}      The grid of the next step
     */
    getIncrementedGrid(grid) {
        const currentGrid = grid.slice();
        // Note: Since JS doesn't have a native deep copy function, we'll create
        // the next grid from a bare array.
        let nextGrid = [];

        for (let y = 0; y < this.state.height; y++) {
            let row = [];
            for (let x = 0; x < this.state.width; x++) {
                row.push({ticked: this.getIncrementedCell(currentGrid, x, y)});
            }

            nextGrid.push(row);
        }

        return nextGrid;
    }

    /**
     * Ticks or unticks a square.
     */
    handleSquareClick(x, y) {
        // Note: this.state.grid is mutated since .slice() doesn't do a deep
        // copy.
        const grid = this.state.grid.slice();
        grid[y][x].ticked = !grid[y][x].ticked;
        this.setState({grid});
    }

    /**
     * Toggles the game to run its steps automatically.
     */
    toggleGame() {
        let interval = null;
        if (this.state.isGameRunning) {
            clearInterval(this.state.interval);
        } else {
            interval = setInterval(() => this.incrementStep(), 1000 / this.state.stepsPerSecond);
        }

        this.setState({
            interval,
            isGameRunning: !this.state.isGameRunning,
        });
    }

    /**
     * Does the logic of this.toggleGame() twice.
     */
    updateGameSpeedWhileRunning() {
        if (!this.state.isGameRunning) {
            return;
        }

        clearInterval(this.state.interval);
        let interval = setInterval(() => this.incrementStep(), 1000 / this.state.stepsPerSecond);

        this.setState({
            interval,
            isGameRunning: true,
        });
    }

    /**
     * Updates the board width but clears the grid.
     */
    updateBoardWidth(e) {
        let width = e.target.value;
        let grid = this.createGrid(width, this.state.height);
        this.setState({
            width,
            grid,
        });
    }

    /**
     * Updates the board height but clears the grid.
     */
    updateBoardHeight(e) {
        let height = e.target.value;
        let grid = this.createGrid(this.state.width, height);
        this.setState({
            height,
            grid,
        });
    }

    /**
     * Updates the game speed.
     */
    updateGameSpeed(e) {
        this.setState({stepsPerSecond: e.target.value});

        if (this.state.isGameRunning) {
            this.updateGameSpeedWhileRunning();
        }
    }

    render() {
        const grid = this.state.grid.slice();

        return (
            <div className="conway-game-of-life-game">
                <ConwayGameOfLifeBoard
                    grid={grid}
                    width={this.state.width}
                    height={this.state.height}
                    onClick={(x, y) => this.handleSquareClick(x, y)}
                />
                <ConwayGameOfLifeControls
                    width={this.state.width}
                    height={this.state.height}
                    toggleGame={() => this.toggleGame()}
                    isGameRunning={this.state.isGameRunning}
                    updateBoardWidth={(e) => this.updateBoardWidth(e)}
                    updateBoardHeight={(e) => this.updateBoardHeight(e)}
                    stepsPerSecond={this.state.stepsPerSecond}
                    currentStep={this.state.currentStep}
                    updateGameSpeed={(e) => this.updateGameSpeed(e)}
                    incrementStep={() => this.incrementStep()}
                />
            </div>
        );
    }
}

class ConwayGameOfLifeControls extends React.Component {
    render() {
        return (
            <div className="conway-game-of-life-controls">
                <label>
                    Width
                    <input name="width" type="number" min="1" max="100"
                        value={this.props.width}
                        onChange={this.props.updateBoardWidth}
                    />
                </label>

                <label>
                    Height
                    <input name="height" type="number" min="1" max="100"
                        value={this.props.height}
                        onChange={this.props.updateBoardHeight}
                    />
                </label>

                <br />

                <label>
                    Game Speed (Steps per Second)
                    <input name="height" type="number" min="3" max="100"
                        value={this.props.stepsPerSecond}
                        onChange={this.props.updateGameSpeed}
                    />
                </label>

                <button
                    onClick={this.props.toggleGame}
                >
                    {this.props.isGameRunning ? 'Stop' : 'Start'}
                </button>

                <br />

                <label>Current Step</label>
                {' '}
                <span>{this.props.currentStep}</span>

                <button
                    onClick={this.props.incrementStep}
                >
                    Increment Step
                </button>
            </div>
        );
    }
}

class ConwayGameOfLifeBoard extends React.Component {
    renderSquare(x, y) {
        return (
            <ConwayGameOfLifeSquare
                key={x + '-' + y}
                ticked={this.props.grid[y][x].ticked}
                onClick={() => this.props.onClick(x, y)}
            />
        );
    }

    render() {
        let squares = [];
        // Set the top leftmost square as coordinate (0, 0), so the first row
        // should have the pattern (0, 0), (0, 1), etc.
        for (let y = 0; y < this.props.height; y++) {
            for (let x = 0; x < this.props.width; x++) {
                squares.push(this.renderSquare(x, y));
            }
        }

        let inlineStyle = {
            width: (this.props.width * 20) + 'px',
        };

        return (
            <div
                className="conway-game-of-life-board"
                style={inlineStyle}
            >
                {squares}
            </div>
        );
    }
}

function ConwayGameOfLifeSquare(props) {
    let className = props.ticked
        ? 'conway-game-of-life-square ticked'
        : 'conway-game-of-life-square';

    return (
        <div
            className={className}
            onClick={props.onClick}
        >
        </div>
    );
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>
          <a href="https://miiido.github.io">Back to Shironeko Projects</a>
        </div>
        <div>
          <a href="https://github.com/miiido/shironeko-projects/">Source Code</a>
        </div>
        <div>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={logo} className="App-logo" alt="logo" />
            Learn React
          </a>
        </div>
      </header>
      <div className="App-body">
          <h2>Conway's Game of Life</h2>
          <p>
              This is Conway's Game of Life created using React.js. For
              more information on the game logic, refer to the Wikipedia page:
              {' '}
              <a
                  className="App-link"
                  href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
                  target="_blank"
                  rel="noopener noreferrer"
              >
                  here
              </a>
          </p>
        <ConwayGameOfLifeGame width={4} height={4} stepsPerSecond={10} template={'oscillating'} />
      </div>
      <footer className="App-footer">
        Shironeko Projects 2020
      </footer>
    </div>
  );
}

export default App;
