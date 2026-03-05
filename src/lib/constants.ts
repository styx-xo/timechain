/** Planck energy in Joules */
export const E_P = 1.956e9;

/** Terminal supply cap in satoshis */
export const C_TERMINAL = 2_100_000_000_000_000;

/** Halving interval in blocks */
export const HALVING_INTERVAL = 210_000;

/** Initial subsidy in satoshis */
export const INITIAL_SUBSIDY = 5_000_000_000;

/** Total number of halving eras (subsidy reaches 0 after era 33) */
export const TOTAL_ERAS = 33;

/** Terminal Satoshi's Constant (E_P / C_TERMINAL) in J/sat */
export const SC_TERMINAL = E_P / C_TERMINAL;

/** Average block interval in seconds */
export const AVG_BLOCK_TIME = 600;
