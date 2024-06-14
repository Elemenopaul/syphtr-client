export interface Profile {
  id: number;
  name: string;
  jobs: number[];
  // add other fields as necessary
}

export interface Client {
  id: number;
  name: string;
  jobs: Job[];
}

export interface Job {
  id: number;
  client: Client; // Replace clientId with client
  department: string;
  businessUnit: string;
  hiringTeam: string[];
  title: string;
  salary: number;
  currency: string;
  openSince: Date;
  createdAt: Date;
  updatedAt: Date;
  candidates: Profile[];
  userId: string;
}

  