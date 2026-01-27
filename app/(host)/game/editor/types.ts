import {GameCategory, GameQuestion, GameRound, GameTeam} from "@/src/dto/game.dto";

export type UIRound = GameRound & { _tmpId?: string };
export type UIQuestion = GameQuestion & { _tmpId?: string };
export type UICategory = GameCategory & { _tmpId?: string };
export type UITeam = GameTeam & { _tmpId?: string };
