import { Container, Graphics } from 'pixi.js';
import { Gem } from './Gem';
import { GRID_SIZE, GEM_SIZE, GemType, PowerUpType } from './Constants';

export class Board extends Container {
    private gems: (Gem | null)[][] = [];
    private selectedGem: Gem | null = null;
    private isProcessing: boolean = false;
    public onScoreUpdate: (score: number) => void = () => {};

    constructor() {
        super();
        this.createBackground();
        this.initializeGems();
    }

    private createBackground() {
        const bg = new Graphics();
        bg.roundRect(-10, -10, GRID_SIZE * GEM_SIZE + 20, GRID_SIZE * GEM_SIZE + 20, 15);
        bg.fill(0x1a1a2e); // Deep space blue

        for(let i=0; i <= GRID_SIZE; i++) {
            bg.moveTo(i * GEM_SIZE, 0);
            bg.lineTo(i * GEM_SIZE, GRID_SIZE * GEM_SIZE);
            bg.moveTo(0, i * GEM_SIZE);
            bg.lineTo(GRID_SIZE * GEM_SIZE, i * GEM_SIZE);
        }
        bg.stroke({ color: 0x16213e, width: 2, alpha: 0.5 });

        this.addChild(bg);
    }

    private initializeGems() {
        for (let x = 0; x < GRID_SIZE; x++) {
            this.gems[x] = [];
            for (let y = 0; y < GRID_SIZE; y++) {
                let type: GemType;
                do {
                    type = Math.floor(Math.random() * 6) as GemType;
                } while (this.wouldMatchAtStart(x, y, type));

                const gem = new Gem(type, x, y);
                this.gems[x][y] = gem;
                this.addChild(gem);

                gem.on('pointerdown', () => this.onGemClick(gem));
            }
        }
    }

    private wouldMatchAtStart(x: number, y: number, type: GemType): boolean {
        if (x >= 2 && this.gems[x - 1][y]?.type === type && this.gems[x - 2][y]?.type === type) return true;
        if (y >= 2 && this.gems[x][y - 1]?.type === type && this.gems[x][y - 2]?.type === type) return true;
        return false;
    }

    private async onGemClick(gem: Gem) {
        if (this.isProcessing) return;

        if (!this.selectedGem) {
            this.selectedGem = gem;
            gem.select();
        } else {
            if (this.areAdjacent(this.selectedGem, gem)) {
                await this.swapGems(this.selectedGem, gem);
            } else {
                this.selectedGem.deselect();
                this.selectedGem = gem;
                gem.select();
            }
        }
    }

    private areAdjacent(g1: Gem, g2: Gem): boolean {
        return Math.abs(g1.gridX - g2.gridX) + Math.abs(g1.gridY - g2.gridY) === 1;
    }

    private async swapGems(g1: Gem, g2: Gem) {
        this.isProcessing = true;
        g1.deselect();
        this.selectedGem = null;

        const x1 = g1.gridX, y1 = g1.gridY;
        const x2 = g2.gridX, y2 = g2.gridY;

        await Promise.all([
            g1.moveTo(x2, y2),
            g2.moveTo(x1, y1)
        ]);

        this.gems[x1][y1] = g2;
        this.gems[x2][y2] = g1;

        const matchGroups = this.findMatches();
        if (matchGroups.length > 0) {
            await this.handleMatches(matchGroups);
        } else {
            await Promise.all([
                g1.moveTo(x1, y1),
                g2.moveTo(x2, y2)
            ]);
            this.gems[x1][y1] = g1;
            this.gems[x2][y2] = g2;
            this.isProcessing = false;
        }
    }

    private findMatches(): Gem[][] {
        const matches: Set<Gem>[] = [];

        for (let y = 0; y < GRID_SIZE; y++) {
            let matchLength = 1;
            for (let x = 0; x < GRID_SIZE; x++) {
                if (x < GRID_SIZE - 1 && this.gems[x][y]?.type === this.gems[x+1][y]?.type) {
                    matchLength++;
                } else {
                    if (matchLength >= 3) {
                        const matchGroup = new Set<Gem>();
                        for (let i = 0; i < matchLength; i++) {
                            matchGroup.add(this.gems[x - i][y]!);
                        }
                        matches.push(matchGroup);
                    }
                    matchLength = 1;
                }
            }
        }

        for (let x = 0; x < GRID_SIZE; x++) {
            let matchLength = 1;
            for (let y = 0; y < GRID_SIZE; y++) {
                if (y < GRID_SIZE - 1 && this.gems[x][y]?.type === this.gems[x][y+1]?.type) {
                    matchLength++;
                } else {
                    if (matchLength >= 3) {
                        const matchGroup = new Set<Gem>();
                        for (let i = 0; i < matchLength; i++) {
                            matchGroup.add(this.gems[x][y - i]!);
                        }
                        matches.push(matchGroup);
                    }
                    matchLength = 1;
                }
            }
        }

        const mergedMatches: Set<Gem>[] = [];
        matches.forEach(m => {
            let merged = false;
            for (let existing of mergedMatches) {
                if ([...m].some(gem => existing.has(gem))) {
                    m.forEach(gem => existing.add(gem));
                    merged = true;
                    break;
                }
            }
            if (!merged) mergedMatches.push(m);
        });

        return mergedMatches.map(set => Array.from(set));
    }

    private async handleMatches(matchGroups: Gem[][]) {
        let totalScore = 0;
        const gemsToDestroy = new Set<Gem>();
        const powerUpsToCreate: { type: GemType, powerUp: PowerUpType, x: number, y: number }[] = [];

        for (const group of matchGroups) {
            totalScore += group.length * 10;
            let powerUpType = PowerUpType.NONE;

            const xs = new Set(group.map(g => g.gridX));
            const ys = new Set(group.map(g => g.gridY));

            if (group.length >= 5) {
                powerUpType = PowerUpType.COLOR_WHEEL;
            } else if (xs.size > 1 && ys.size > 1) {
                powerUpType = PowerUpType.BOMB;
            } else if (group.length === 4) {
                powerUpType = (xs.size === 1) ? PowerUpType.STRIPED_HORIZONTAL : PowerUpType.STRIPED_VERTICAL;
            }

            if (powerUpType !== PowerUpType.NONE) {
                const spawnPos = group[0];
                powerUpsToCreate.push({ type: group[0].type, powerUp: powerUpType, x: spawnPos.gridX, y: spawnPos.gridY });
            }

            for (const gem of group) {
                this.collectGemsToDestroy(gem, gemsToDestroy);
            }
        }

        this.onScoreUpdate(totalScore);

        const destroyPromises = Array.from(gemsToDestroy).map(async (gem) => {
            this.gems[gem.gridX][gem.gridY] = null;
            await gem.pop();
        });
        await Promise.all(destroyPromises);

        for (const pu of powerUpsToCreate) {
            const newGem = new Gem(pu.type, pu.x, pu.y, pu.powerUp);
            this.gems[pu.x][pu.y] = newGem;
            this.addChild(newGem);
            newGem.on('pointerdown', () => this.onGemClick(newGem));
        }

        await this.dropGems();
        const nextMatches = this.findMatches();
        if (nextMatches.length > 0) {
            await this.handleMatches(nextMatches);
        } else {
            this.isProcessing = false;
        }
    }

    private collectGemsToDestroy(gem: Gem, toDestroy: Set<Gem>) {
        if (toDestroy.has(gem)) return;
        toDestroy.add(gem);

        if (gem.powerUp === PowerUpType.STRIPED_HORIZONTAL) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const target = this.gems[x][gem.gridY];
                if (target) this.collectGemsToDestroy(target, toDestroy);
            }
        } else if (gem.powerUp === PowerUpType.STRIPED_VERTICAL) {
            for (let y = 0; y < GRID_SIZE; y++) {
                const target = this.gems[gem.gridX][y];
                if (target) this.collectGemsToDestroy(target, toDestroy);
            }
        } else if (gem.powerUp === PowerUpType.BOMB) {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const nx = gem.gridX + dx;
                    const ny = gem.gridY + dy;
                    if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                        const target = this.gems[nx][ny];
                        if (target) this.collectGemsToDestroy(target, toDestroy);
                    }
                }
            }
        } else if (gem.powerUp === PowerUpType.COLOR_WHEEL) {
            const targetType = Math.floor(Math.random() * 6) as GemType;
            for (let x = 0; x < GRID_SIZE; x++) {
                for (let y = 0; y < GRID_SIZE; y++) {
                    const target = this.gems[x][y];
                    if (target && target.type === targetType) {
                        this.collectGemsToDestroy(target, toDestroy);
                    }
                }
            }
        }
    }

    private async dropGems() {
        const dropPromises: Promise<void>[] = [];

        for (let x = 0; x < GRID_SIZE; x++) {
            let emptySpaces = 0;
            for (let y = GRID_SIZE - 1; y >= 0; y--) {
                if (this.gems[x][y] === null) {
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    const gem = this.gems[x][y]!;
                    this.gems[x][y + emptySpaces] = gem;
                    this.gems[x][y] = null;
                    dropPromises.push(gem.moveTo(x, y + emptySpaces));
                }
            }

            for (let i = 0; i < emptySpaces; i++) {
                const type = Math.floor(Math.random() * 6) as GemType;
                const newGem = new Gem(type, x, i - emptySpaces);
                this.gems[x][i] = newGem;
                this.addChild(newGem);
                newGem.on('pointerdown', () => this.onGemClick(newGem));
                dropPromises.push(newGem.moveTo(x, i));
            }
        }

        await Promise.all(dropPromises);
    }
}
