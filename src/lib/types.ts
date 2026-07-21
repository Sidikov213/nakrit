export interface Payment {
  id: string;
  reason: string;
  date: string;
}

export interface Friend {
  id: string;
  name: string;
  emoji: string;
  payments: Payment[];
  updatedAt: string;
}

export interface FriendInput {
  name: string;
  emoji?: string;
}

export interface PaymentInput {
  reason: string;
}
