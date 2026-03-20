import { Container, Text, TextStyle } from 'pixi.js';

export class HUD extends Container {
    private scoreText: Text;
    private scoreValue: number = 0;

    constructor() {
        super();

        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontWeight: 'bold',
            fill: 0xffffff,
            stroke: { color: 0x4a1850, width: 5 },
            dropShadow: {
                color: 0x000000,
                blur: 4,
                angle: Math.PI / 6,
                distance: 6,
            }
        });

        const titleText = new Text({ text: 'COSMIC GEMS', style });
        titleText.anchor.set(0.5, 0);
        titleText.x = 0;
        titleText.y = -80;
        this.addChild(titleText);

        const scoreStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 28,
            fontWeight: 'bold',
            fill: 0xffffff,
            stroke: { color: 0x4a1850, width: 5 },
            dropShadow: {
                color: 0x000000,
                blur: 4,
                angle: Math.PI / 6,
                distance: 6,
            }
        });
        this.scoreText = new Text({ text: 'Score: 0', style: scoreStyle });
        this.scoreText.anchor.set(0.5, 0);
        this.scoreText.x = 0;
        this.scoreText.y = -30;
        this.addChild(this.scoreText);
    }

    public updateScore(amount: number) {
        this.scoreValue += amount;
        this.scoreText.text = `Score: ${this.scoreValue}`;

        // Quick animation for score update
        this.scoreText.scale.set(1.2);
        import('gsap').then(gsap => {
            gsap.default.to(this.scoreText.scale, { x: 1, y: 1, duration: 0.2 });
        });
    }
}
