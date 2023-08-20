import { ParticipantInterface } from "../models/participant";

export interface SignUpRequestBody {
  email: string;
  userName: string;
  password: string;
  confirmPassword: string;
}

export interface LogInRequestBody {
  email: string;
  password: string;
}

export interface JwtClaims {
  userId: Number;
  fingerprint: string;
}

export interface AddStoryRequestBody {
  userId: number;
  name: string;
  description: string;
}

export interface AddParticipantRequestBody {
  role: string;
}

export interface EditStoryRequestBody extends AddStoryRequestBody {}

export interface AddParticipantReturn extends ParticipantInterface {
  username: string;
}

export interface SocketRoomArgs {
  action: string;
  id: string;
  username?: string;
  role?: string;
}

export interface SocketStoryArgs {
  action: string;
  storyId: number;
  sessionId: string;
}
