import { Container, Graphics } from 'pixi.js';
import gsap from 'gsap';

export class Effects {
    public static createBurst(container: Container, x: number, y: number, color: number) {
        const count = 8;
        for (let i = 0; i < count; i++) {
            const particle = new Graphics();
            particle.circle(0, 0, 4);
            particle.fill({ color, alpha: 0.8 });
            particle.x = x;
            particle.y = y;
            container.addChild(particle);

            const angle = (i / count) * Math.PI * 2;
            const distance = 40 + Math.random() * 20;

            gsap.to(particle, {
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                duration: 0.5,
                ease: 'power2.out',
                onComplete: () => particle.destroy()
            });
        }
    }
}
