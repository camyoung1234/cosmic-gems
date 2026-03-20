import { Container, Graphics } from 'pixi.js';
import { GemType, PowerUpType, GEM_SIZE } from './Constants';
import gsap from 'gsap';
import { Effects } from './Effects';

export class Gem extends Container {
    public type: GemType;
    public powerUp: PowerUpType;
    public gridX: number;
    public gridY: number;
    private sprite: Graphics;
    private glow: Graphics;
    private pulseTween?: gsap.core.Tween;

    constructor(type: GemType, x: number, y: number, powerUp: PowerUpType = PowerUpType.NONE) {
        super();
        this.type = type;
        this.gridX = x;
        this.gridY = y;
        this.powerUp = powerUp;

        this.x = x * GEM_SIZE + GEM_SIZE / 2;
        this.y = y * GEM_SIZE + GEM_SIZE / 2;

        this.glow = new Graphics();
        this.drawGlow();
        this.addChild(this.glow);
        this.glow.alpha = 0;

        this.sprite = new Graphics();
        this.drawGem();
        this.addChild(this.sprite);

        this.eventMode = 'static';
        this.cursor = 'pointer';

        if (this.powerUp !== PowerUpType.NONE) {
            this.startPulse();
        }
    }

    private drawGlow() {
        const color = this.getGemColor();
        this.glow.clear();
        this.glow.circle(0, 0, GEM_SIZE / 1.5);
        this.glow.fill({ color, alpha: 0.5 });
    }

    private drawGem() {
        const color = this.getGemColor();
        this.sprite.clear();

        switch(this.type) {
            case GemType.RED: // Diamond
                this.sprite.poly([-20, 0, 0, -28, 20, 0, 0, 28]);
                break;
            case GemType.BLUE: // Hexagon
                this.sprite.poly([-20, -10, 0, -25, 20, -10, 20, 10, 0, 25, -20, 10]);
                break;
            case GemType.GREEN: // Square
                this.sprite.rect(-20, -20, 40, 40);
                break;
            case GemType.YELLOW: // Triangle
                this.sprite.poly([0, -25, 25, 20, -25, 20]);
                break;
            case GemType.PURPLE: // Circle
                this.sprite.circle(0, 0, 22);
                break;
            case GemType.ORANGE: // Star-ish
                this.sprite.poly([0, -25, 10, -10, 25, 0, 10, 10, 0, 25, -10, 10, -25, 0, -10, -10]);
                break;
        }
        this.sprite.fill(color);

        // Add shine
        this.sprite.ellipse(-8, -8, 6, 4);
        this.sprite.fill({ color: 0xFFFFFF, alpha: 0.4 });

        if (this.powerUp !== PowerUpType.NONE) {
            this.drawPowerUpIndicator();
        }
    }

    private drawPowerUpIndicator() {
        const indicator = new Graphics();

        if (this.powerUp === PowerUpType.STRIPED_HORIZONTAL) {
            indicator.moveTo(-15, 0);
            indicator.lineTo(15, 0);
            indicator.stroke({ color: 0xFFFFFF, width: 3, alpha: 0.8 });
        } else if (this.powerUp === PowerUpType.STRIPED_VERTICAL) {
            indicator.moveTo(0, -15);
            indicator.lineTo(0, 15);
            indicator.stroke({ color: 0xFFFFFF, width: 3, alpha: 0.8 });
        } else if (this.powerUp === PowerUpType.BOMB) {
            indicator.circle(0, 0, 15);
            indicator.fill({ color: 0xFFFFFF, alpha: 0.3 });
            indicator.stroke({ color: 0xFFFFFF, width: 2, alpha: 0.8 });
        } else if (this.powerUp === PowerUpType.COLOR_WHEEL) {
             indicator.circle(0,0, 25);
             indicator.stroke({ color: 0xFFFFFF, width: 4, alpha: 0.8 });
        }
        this.addChild(indicator);
    }

    public getGemColor(): number {
        switch(this.type) {
            case GemType.RED: return 0xFF3333;
            case GemType.BLUE: return 0x3333FF;
            case GemType.GREEN: return 0x33FF33;
            case GemType.YELLOW: return 0xFFFF33;
            case GemType.PURPLE: return 0xAA33FF;
            case GemType.ORANGE: return 0xFF9933;
            default: return 0xFFFFFF;
        }
    }

    private startPulse() {
        this.pulseTween = gsap.to(this.scale, {
            x: 1.1,
            y: 1.1,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }

    public select() {
        gsap.to(this.scale, { x: 1.2, y: 1.2, duration: 0.2 });
        gsap.to(this.glow, { alpha: 1, duration: 0.2 });
    }

    public deselect() {
        gsap.to(this.scale, { x: 1, y: 1, duration: 0.2 });
        gsap.to(this.glow, { alpha: 0, duration: 0.2 });
    }

    public moveTo(x: number, y: number): Promise<void> {
        this.gridX = x;
        this.gridY = y;
        return new Promise((resolve) => {
            gsap.to(this, {
                x: x * GEM_SIZE + GEM_SIZE / 2,
                y: y * GEM_SIZE + GEM_SIZE / 2,
                duration: 0.3,
                ease: 'power2.out',
                onComplete: resolve
            });
        });
    }

    public async pop(): Promise<void> {
        if (this.pulseTween) this.pulseTween.kill();
        if (this.parent) {
            Effects.createBurst(this.parent, this.x, this.y, this.getGemColor());
        }
        await gsap.to(this.scale, { x: 1.5, y: 1.5, duration: 0.1 });
        await gsap.to(this, { alpha: 0, duration: 0.1 });
        this.destroy();
    }
}
