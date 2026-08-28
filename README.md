# Little Life Lab

A playful, dependency-free version of Conway's Game of Life. Draw patterns on a large 64 × 40 toy-like grid and watch them evolve.

## Play

The live app is available at **https://buildlittleworlds.github.io/game-of-life-cartoony/**.

- Click or drag to make cells alive.
- Start a drag on a live cell to erase.
- Use **Play/Pause**, **Step**, **Clear**, and the speed slider to control the simulation.
- With the board focused, use the arrow keys to move, **Enter** to toggle a cell, and **Space** to play or pause.

The board follows Conway's standard rules. Its opposite edges connect, so patterns that leave one side re-enter from the other.

## Run locally

This is a static site with no runtime dependencies. Serve the project folder with any local web server, then open `index.html` through that server. For example:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Tests

With Node.js installed:

```sh
npm test
```

## Deployment

Pushes to `main` deploy automatically through the GitHub Pages workflow in `.github/workflows/deploy-pages.yml`. In the repository settings, **Pages → Build and deployment → Source** must be set to **GitHub Actions**.
