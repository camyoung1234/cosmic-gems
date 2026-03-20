export const GRID_SIZE = 8;
export const GEM_SIZE = 64;
export const MARGIN = 4;
export const BOARD_OFFSET_X = 100;
export const BOARD_OFFSET_Y = 100;

export enum GemType {
    RED = 0,
    BLUE = 1,
    GREEN = 2,
    YELLOW = 3,
    PURPLE = 4,
    ORANGE = 5
}

export enum PowerUpType {
    NONE = 0,
    STRIPED_HORIZONTAL = 1,
    STRIPED_VERTICAL = 2,
    BOMB = 3,
    COLOR_WHEEL = 4
}
