// Type definitions for spirit-protocol-sdk

export interface HealthStatus {
  status: 'online' | 'offline' | 'degraded';
  endpoint?: string;
  error?: string;
  version?: string;
  online?: number;
}

export interface RegistrationGuide {
  name: string;
  version: string;
  description: string;
  registry: string;
  howToRegister: object;
  documentation: string[];
  relatedServices: object;
}

export interface Manifesto {
  id: string;
  title: string;
  content: string;
  date: string;
  tokenId?: string;
}

export interface EcosystemHealth {
  airc: HealthStatus;
  vibe: HealthStatus;
  solienne: HealthStatus;
  spirit: HealthStatus;
  timestamp: string;
}

export const airc: {
  register(): Promise<RegistrationGuide>;
  docs(): Promise<string>;
  health(): Promise<HealthStatus>;
};

export const vibe: {
  who(): Promise<any[]>;
  docs(): Promise<string>;
  health(): Promise<HealthStatus>;
};

export const solienne: {
  manifestos(limit?: number): Promise<Manifesto[]>;
  latest(): Promise<Manifesto>;
  docs(): Promise<string>;
  health(): Promise<HealthStatus>;
};

export const spirit: {
  docs(): Promise<string>;
  health(): Promise<HealthStatus>;
};

export function healthCheck(): Promise<EcosystemHealth>;

export function configure(options: {
  airc?: string;
  vibe?: string;
  solienne?: string;
  spirit?: string;
}): void;

export const version: string;
