import { Application, Container, Graphics } from 'pixi.js';
import { Board } from './game/Board';
import { HUD } from './ui/HUD';
import { GRID_SIZE, GEM_SIZE } from './game/Constants';

async function init() {
    const app = new Application();
    await app.init({
        resizeTo: window,
        backgroundColor: 0x000000,
        antialias: true,
    });

    document.getElementById('app')!.appendChild(app.canvas);

    // Create a cosmic background
    const bgContainer = new Container();
    app.stage.addChild(bgContainer);

    for (let i = 0; i < 300; i++) {
        const star = new Graphics();
        const size = Math.random() * 2;
        star.circle(0, 0, size);
        star.fill({ color: 0xFFFFFF, alpha: Math.random() });
        star.x = Math.random() * app.screen.width;
        star.y = Math.random() * app.screen.height;
        bgContainer.addChild(star);
    }

    const board = new Board();
    const hud = new HUD();

    const gameContainer = new Container();
    gameContainer.addChild(board);
    gameContainer.addChild(hud);

    app.stage.addChild(gameContainer);

    const resize = () => {
        gameContainer.x = app.screen.width / 2 - (GRID_SIZE * GEM_SIZE) / 2;
        gameContainer.y = app.screen.height / 2 - (GRID_SIZE * GEM_SIZE) / 2 + 50;

        hud.x = (GRID_SIZE * GEM_SIZE) / 2;
        hud.y = -50;
    };

    board.onScoreUpdate = (score) => hud.updateScore(score);

    window.addEventListener('resize', resize);
    resize();
}

init();
