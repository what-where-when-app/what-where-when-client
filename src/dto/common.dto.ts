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
  PREPARATION = 'PREPARATION',
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


export enum AdminRequestEvent {
  Sync = 'admin:sync', // Initial synchronization: joins admin room and fetches all game data
  StartGame = 'admin:start_game', // Transitions game status from DRAFT to LIVE
  PrepareQuestion = 'admin:prepare_question', // Triggers preparation state of the question (PREPARATION phase)
  NextQuestion = 'admin:next_question', // Triggers PrepareQuestion under the hood (PREPARATION phase)
  StartQuestion = 'admin:start_question', // Triggers the start of a specific question cycle (THINKING phase, timer start)
  StopQuestion = 'admin:stop_question', // Stops ANSWERING phase (IDLE phase)
  JudgeAnswer = 'admin:judge_answer', // Submits host's verdict (correct/wrong) for a team's answer
  AdjustTime = 'admin:adjust_time', // Adds or subtracts seconds from the current active timer
  PauseTimer = 'admin:pause_timer', // Pauses the current question timer
  ResumeTimer = 'admin:resume_timer', // Resumes the current question timer
  FinishGame = 'admin:finish_game' // Transitions game status from LIVE to FINISHED
}

/**
 * Events sent from the Server specifically to Admins
 */
export enum AdminResponseEvent {
  AnswerUpdate = 'admin:answer_update',
  NewDispute = 'admin:new_dispute',
}

/**
 * Events sent from the Player to the Server
 */
export enum PlayerRequestEvent {
  JoinGame = 'join_game',
  SubmitAnswer = 'player:submit_answer',
  Dispute = 'player:dispute',
  SyncHistory = 'sync_history',
  SyncLeaderboard = 'sync_leaderboard',
}

/**
 * Events sent from the Server specifically to a Player
 */
export enum PlayerResponseEvent {
  AnswerReceived = 'answer_received', // Confirmation that the team's answer was successfully saved
  HistoryUpdate = 'history_update',
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