export interface ChatuUser {
  uid: string;
  displayName: string;
  level: number;
  xp: number;
  chatus: number;
  avatarParts: string[];
  badges: string[];
  clubId?: string;
  dailyLoginLast?: string;
  isPremium?: boolean;
  debt?: number;
  claimedRewards?: number[];
}

export interface ChatuClub {
  id: string;
  name: string;
  ownerId: string;
  balance: number;
  levelRequired: number;
  memberCount: number;
}

export interface MarketItem {
  id: string;
  type: 'web' | 'game' | 'avatar';
  creatorId: string;
  ownerId: string;
  price: number;
  title: string;
  description: string;
  commission?: number;
}

export interface Competition {
  id: string;
  title: string;
  type: string;
  rewardPool: number;
  endsAt: string;
}

export interface ChatMessage {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  roomId: string;
}
