export type ID = number;
export type ISODateTime = string;

export interface Pagination {
  limit: number;
  offset: number;
  total: number;
}

export const GameStatuses = {
  DRAFT: 'DRAFT',
  LIVE: 'LIVE',
  FINISHED: 'FINISHED',
}

export type GameStatus = (typeof GameStatuses)[keyof typeof GameStatuses];

export enum GamePhase {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  ANSWERING = 'ANSWERING',
}

export interface ApiError {
  code:
    | 'VALIDATION_ERROR'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'RATE_LIMITED'
    | 'INTERNAL_ERROR';
  message: string;
  details?: Record<string, unknown>;
}

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };


/**
 * Events sent from the Host/Admin to the Server
 */
export enum AdminRequestEvent {
  Sync = 'admin:sync', // Initial synchronization: joins admin room and fetches all game data
  StartGame = 'admin:start_game', // Transitions game status from DRAFT to LIVE
  StartQuestion = 'admin:start_question', // Triggers the start of a specific question cycle
  JudgeAnswer = 'admin:judge_answer', // Submits host's verdict (correct/wrong) for a team's answer
  AdjustTime = 'admin:adjust_time', // Adds or subtracts seconds from the current active timer
  PauseTimer = 'admin:pause_timer', // Pauses the current question timer
  ResumeTimer = 'admin:resume_timer', // Resumes the current question timer
  NextQuestion = 'admin:next_question'
}

/**
 * Events sent from the Server specifically to Admins
 */
export enum AdminResponseEvent {
  AnswerUpdate = 'admin:answer_update', // Pushes a single AnswerDomain object when a team submits or host judges
  NewDispute = 'admin:new_dispute', // Notifies admins about a team raising a dispute
}

/**
 * Events sent from the Player to the Server
 */
export enum PlayerRequestEvent {
  JoinGame = 'join_game', // Initial request to join the public game room
  SubmitAnswer = 'player:submit_answer', // Sends the team's answer text to the server
  Dispute = 'player:dispute', // Team challenges a host's verdict
}

/**
 * Events sent from the Server specifically to a Player
 */
export enum PlayerResponseEvent {
  AnswerReceived = 'answer_received',   // Confirmation that the team's answer was successfully saved
}

/**
 * Global broadcast events sent by the Server to all connected clients in the game room
 */
export enum GameBroadcastEvent {
  SyncState = 'sync_state', // Response to sync requests: provides current phase, timer, and active question
  TimerUpdate = 'timer_update', // Periodic tick providing current seconds and active phase
  StatusChanged = 'game_status_changed', // Notification when game moves to LIVE or FINISHED status
  LeaderboardUpdate = 'leaderboard_update', // Pushes the latest team scores/rankings
  TimerPaused = 'timer_paused',
  TimerResumed = 'timer_resumed',
}

export enum AnswerStatus {
  UNSET = 'UNSET',
  CORRECT = 'CORRECT',
  INCORRECT = 'INCORRECT',
  DISPUTABLE = 'DISPUTABLE'
}
