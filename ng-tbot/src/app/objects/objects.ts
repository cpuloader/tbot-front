export class TwitterPerson {
    id: number;
    name: string;
    tw_id?: number;
}

export class TwitterAccount {
    id: number;
    api_key?: string;
    api_secret?: string;
    api_key_stars: string;
    api_secret_stars: string;
    token?: string;
    access_token?: string;
    access_token_secret?: string;
    is_active?: boolean;
}

export class TradePairType {
    id?: number;
    name: string;
    is_coin: boolean;
}

export class KeyImage {
    id: number;
    image_name: string;
    image_id: number;
    coin_id: number;
    image: string;
    image_preview: string;
}

export class TradePair {
    constructor() {
        this.id = -1;
        this.accounts = [];
        this.key_words = [];
        this.key_images = [];
        this.is_long = true;
        this.is_active = true;
        this.leverage = 1;
        this.sum = 0;
        this.sum_percent = 0;
        this.stop_loss_percent = undefined;
        this.on_rise_percent = undefined;
        this.trade_stop_percent = undefined;
        this.pair_type = undefined;
        this.can_reverse = false;
    }

    id: number;
    pair_type?: TradePairType;
    accounts: BinanceAccount[];
    key_words: string[];
    key_images: KeyImage[];
    is_active: boolean;
    is_long: boolean;
    leverage: number;
    sum: number | undefined;
    sum_percent: number | undefined;
    stop_loss_percent: number | undefined;
    on_rise_percent: number | undefined;
    trade_stop_percent: number | undefined;
    can_reverse: boolean;
}

export class Avatar {
    picture: string;
    picture_for_profile: string;
    picture_for_preview: string;
}

export class User {
    id: number;
    email: string;
    username: string;
    password: string;
    confirm_password?: string;
    avatarimage?: Avatar;
    tagline: string;
    is_online: boolean;
    bot_is_active: boolean;
}

export interface BinanceAccountAsset {
    //[id: string]: string[];
    currency: string;
    balance: number;
}

export class BinanceAccount {
    constructor() {
        this.is_active = false;
    }

    id: number;
    name: string;
    bnns_key?: string;
    bnns_secret?: string;
    bnns_key_stars?: string;
    bnns_secret_stars?: string;
    is_active: boolean;
    // front only
    testStatus?: number;
    assets?: BinanceAccountAsset[];
}

export class PaginatedTradeSignal {
    results: TradeSignal[];
    next: number;
    prev: number;
    count: number;
}

export class TradeSignal {
    id: number;
    account_name: string;
    state: number;
    twit_id: string;
    twit_acc_name: string;
    trigger_word: string;
    created_at: number;
    closed_at: number;
    first_market_price: number;
    close_market_price: number;
    is_long: boolean;
    leverage: number;
    symbol: string;
    is_coin: boolean;
    currency: string;
    first_order_quantity: number;
    stop_order_quantity: number;
    stop_loss_percent: number;
    on_rise_percent: number;
    trade_stop_percent: number;
}

export class PaginatedTweet {
    results: Tweet[];
    next: number;
    prev: number;
    count: number;
}

export class Tweet {
    id: number;
    tw_id: string;
    author: string;
    text: string;
    created_at: string;
}

export class PositionsWrapper {
    bacc_id: number;
    is_coin: boolean;
    positions: Position[];
}

export class Position {
    bacc_id: number;
    bacc_name: string;
    pair_type: TradePairType;
    symbol: string;
    positionAmt: number;
    leverage: number;
    entryPrice: number;
    markPrice: number;
    liquidationPrice: string;
    unrealizedProfit: number;
}

export interface PanelState {
    id: number;
    opened: boolean;
    closeAll?: boolean;
}

export class EmailData {
    host: string;
    email: string;
    password?: string;
    port: number | null;
}
