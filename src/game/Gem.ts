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
    private tweens: gsap.core.Tween[] = [];
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

        this.startAnimations();

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
        this.sprite.clear();

        switch(this.type) {
            case GemType.RED: { // Star Ruby
                // Outer polygon
                this.sprite.poly([0, -40, 40, 0, 0, 40, -40, 0]);
                this.sprite.fill(0x7f1d1d);
                this.sprite.stroke({ color: 0xef4444, width: 4 });

                // Inner polygon
                const innerPoly = new Graphics();
                innerPoly.poly([0, -25, 25, 0, 0, 25, -25, 0]);
                innerPoly.fill(0xef4444);
                innerPoly.name = 'inner';
                this.sprite.addChild(innerPoly);

                // Center circle
                const centerCircle = new Graphics();
                centerCircle.circle(0, 0, 10);
                centerCircle.fill(0xfca5a5);
                centerCircle.name = 'center';
                this.sprite.addChild(centerCircle);
                break;
            }
            case GemType.BLUE: { // Nebula Sapphire
                // Outer hexagon
                this.sprite.poly([-20, -40, 20, -40, 40, 0, 20, 40, -20, 40, -40, 0]);
                this.sprite.fill(0x1e3a8a);
                this.sprite.stroke({ color: 0x3b82f6, width: 4 });

                const group = new Container();
                group.name = 'group';
                this.sprite.addChild(group);

                // Triangles
                const t1 = new Graphics();
                t1.poly([0, -30, 30, 20, -30, 20]);
                t1.fill({ color: 0x60a5fa, alpha: 0.7 });
                group.addChild(t1);

                const t2 = new Graphics();
                t2.poly([0, 30, -30, -20, 30, -20]);
                t2.fill({ color: 0x93c5fd, alpha: 0.7 });
                group.addChild(t2);

                // Center circle
                const centerCircle = new Graphics();
                centerCircle.circle(0, 0, 8);
                centerCircle.fill(0xeff6ff);
                centerCircle.name = 'center';
                this.sprite.addChild(centerCircle);
                break;
            }
            case GemType.GREEN: { // Nova Emerald
                // Outer rotated rect
                const base = new Graphics();
                base.roundRect(-30, -30, 60, 60, 15);
                base.fill(0x064e3b);
                base.stroke({ color: 0x10b981, width: 4 });
                base.rotation = Math.PI / 4;
                this.sprite.addChild(base);

                // Inner rotated rect
                const inner = new Graphics();
                inner.roundRect(-15, -15, 30, 30, 8);
                inner.fill(0x34d399);
                inner.rotation = Math.PI / 4;
                inner.name = 'inner';
                this.sprite.addChild(inner);

                // Circles
                const c1 = new Graphics();
                c1.circle(0, -25, 3);
                c1.fill(0xa7f3d0);
                c1.name = 'c1';
                this.sprite.addChild(c1);

                const c2 = new Graphics();
                c2.circle(0, 25, 3);
                c2.fill(0xa7f3d0);
                c2.name = 'c2';
                this.sprite.addChild(c2);
                break;
            }
            case GemType.YELLOW: { // Solar Topaz
                // Star path
                this.sprite.moveTo(0, -40);
                this.sprite.lineTo(10, -10);
                this.sprite.lineTo(40, 0);
                this.sprite.lineTo(10, 10);
                this.sprite.lineTo(0, 40);
                this.sprite.lineTo(-10, 10);
                this.sprite.lineTo(-40, 0);
                this.sprite.lineTo(-10, -10);
                this.sprite.closePath();
                this.sprite.fill(0x713f12);
                this.sprite.stroke({ color: 0xfacc15, width: 3 });

                // Inner star
                const inner = new Graphics();
                inner.moveTo(0, -25);
                inner.lineTo(5, -5);
                inner.lineTo(25, 0);
                inner.lineTo(5, 5);
                inner.lineTo(0, 25);
                inner.lineTo(-5, 5);
                inner.lineTo(-25, 0);
                inner.lineTo(-5, -5);
                inner.closePath();
                inner.fill(0xfef08a);
                inner.name = 'inner';
                this.sprite.addChild(inner);

                // Center circle
                const center = new Graphics();
                center.circle(0, 0, 6);
                center.fill(0xffffff);
                center.name = 'center';
                this.sprite.addChild(center);
                break;
            }
            case GemType.PURPLE: { // Void Amethyst
                // Outer circle
                this.sprite.circle(0, 0, 35);
                this.sprite.fill(0x3b0764);
                this.sprite.stroke({ color: 0xa855f7, width: 4 });

                // Inner circle
                const inner = new Graphics();
                inner.circle(0, 0, 20);
                inner.fill(0xc084fc);
                inner.name = 'inner';
                this.sprite.addChild(inner);

                // Orbital group
                const group = new Container();
                group.name = 'group';
                this.sprite.addChild(group);

                const s1 = new Graphics();
                s1.circle(-30, 0, 4);
                s1.fill(0xe9d5ff);
                group.addChild(s1);

                const s2 = new Graphics();
                s2.circle(30, 0, 4);
                s2.fill(0xe9d5ff);
                group.addChild(s2);
                break;
            }
            case GemType.QUARTZ: { // Comet Quartz
                // Irregular polygon
                this.sprite.poly([-20, -30, 20, -20, 30, 20, -10, 30, -30, 0]);
                this.sprite.fill(0x171717);
                this.sprite.stroke({ color: 0xe5e5e5, width: 3 });

                // Dots
                const d1 = new Graphics();
                d1.circle(-10, -10, 3);
                d1.fill(0xffffff);
                d1.name = 'd1';
                this.sprite.addChild(d1);

                const d2 = new Graphics();
                d2.circle(10, 10, 2);
                d2.fill(0xffffff);
                d2.name = 'd2';
                this.sprite.addChild(d2);

                const d3 = new Graphics();
                d3.circle(-5, 15, 4);
                d3.fill(0xa3a3a3);
                d3.name = 'd3';
                this.sprite.addChild(d3);
                break;
            }
        }

        if (this.powerUp !== PowerUpType.NONE) {
            this.drawPowerUpIndicator();
        }
    }

    private startAnimations() {
        switch(this.type) {
            case GemType.RED: {
                const inner = this.sprite.getChildByName('inner');
                const center = this.sprite.getChildByName('center');
                if (inner) {
                    this.tweens.push(gsap.to(inner, { alpha: 0.4, duration: 0.75, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
                }
                if (center) {
                    this.tweens.push(gsap.to(center.scale, { x: 1.4, y: 1.4, duration: 0.75, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
                }
                break;
            }
            case GemType.BLUE: {
                const group = this.sprite.getChildByName('group');
                const center = this.sprite.getChildByName('center');
                if (group) {
                    this.tweens.push(gsap.to(group, { rotation: Math.PI * 2, duration: 6, repeat: -1, ease: 'none' }));
                }
                if (center) {
                    this.tweens.push(gsap.to(center, { alpha: 0.5, duration: 1, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
                }
                break;
            }
            case GemType.GREEN: {
                const inner = this.sprite.getChildByName('inner');
                const c1 = this.sprite.getChildByName('c1');
                const c2 = this.sprite.getChildByName('c2');
                if (inner instanceof Graphics) {
                    this.tweens.push(gsap.to(inner, {
                        pixi: { fillColor: 0x6ee7b7 },
                        duration: 1,
                        repeat: -1,
                        yoyo: true,
                        ease: 'sine.inOut'
                    } as any).vars ? gsap.to(inner, { alpha: 0.5, duration: 1, repeat: -1, yoyo: true }) : null as any);
                    // Fallback since I am not sure if pixi plugin is enabled
                    this.tweens.push(gsap.to(inner, { alpha: 0.7, duration: 1, repeat: -1, yoyo: true }));
                }
                if (c1) {
                    this.tweens.push(gsap.to(c1, { alpha: 0, duration: 0.75, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
                }
                if (c2) {
                    this.tweens.push(gsap.to(c2, { alpha: 0, duration: 0.75, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.75 }));
                }
                break;
            }
            case GemType.YELLOW: {
                const inner = this.sprite.getChildByName('inner');
                const center = this.sprite.getChildByName('center');
                if (inner) {
                    this.tweens.push(gsap.to(inner.scale, { x: 1.2, y: 1.2, duration: 0.5, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
                }
                if (center) {
                    this.tweens.push(gsap.to(center, { alpha: 0.2, duration: 0.5, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
                }
                break;
            }
            case GemType.PURPLE: {
                const inner = this.sprite.getChildByName('inner');
                const group = this.sprite.getChildByName('group');
                if (inner) {
                    this.tweens.push(gsap.to(inner.scale, { x: 1.25, y: 1.25, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
                    this.tweens.push(gsap.to(inner, { alpha: 0.5, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
                }
                if (group) {
                    this.tweens.push(gsap.to(group, { rotation: -Math.PI * 2, duration: 3, repeat: -1, ease: 'none' }));
                }
                break;
            }
            case GemType.QUARTZ: {
                const d1 = this.sprite.getChildByName('d1');
                const d2 = this.sprite.getChildByName('d2');
                const d3 = this.sprite.getChildByName('d3');
                if (d1) {
                    this.tweens.push(gsap.to(d1, { alpha: 0, duration: 0.6, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
                }
                if (d2) {
                    this.tweens.push(gsap.to(d2, { alpha: 0, duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5 }));
                }
                if (d3) {
                    this.tweens.push(gsap.to(d3, { alpha: 0.2, duration: 1, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
                }
                break;
            }
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
            case GemType.RED: return 0xef4444;
            case GemType.BLUE: return 0x3b82f6;
            case GemType.GREEN: return 0x10b981;
            case GemType.YELLOW: return 0xfacc15;
            case GemType.PURPLE: return 0xa855f7;
            case GemType.QUARTZ: return 0xe5e5e5;
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
        this.tweens.forEach(t => t.kill());
        if (this.parent) {
            Effects.createBurst(this.parent, this.x, this.y, this.getGemColor());
        }
        await gsap.to(this.scale, { x: 1.5, y: 1.5, duration: 0.1 });
        await gsap.to(this, { alpha: 0, duration: 0.1 });
        this.destroy();
    }

    public destroy(options?: any) {
        if (this.pulseTween) this.pulseTween.kill();
        this.tweens.forEach(t => t.kill());
        super.destroy(options);
    }
}
