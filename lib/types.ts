export type RunCount = { kind: string; status: string; runs: number };

export type Period = {
  new_users: number;
  new_projects: number;
  runs: RunCount[];
  cost_micros: number;
  llm_calls: number;
};

export type Stats = { total_users: number; today: Period; week: Period };

export type Quota = { sites_left: number; edits_left: number };

export type AdminUser = {
  id: string;
  phone: string;
  name: string;
  telegram_username?: string;
  role: "user" | "admin";
  blocked: boolean;
  created_at: string;
  last_login_at?: string;
  quota: Quota | null;
  projects: number;
  cost_micros: number;
};

export type AdminProject = {
  id: string;
  name: string;
  type: string;
  head_version: number;
  owner_id: string;
  owner_phone: string;
  owner_name: string;
  preview_url?: string;
  created_at: string;
};

export type AdminRun = {
  id: string;
  project_id: string;
  project_name: string;
  kind: "initial" | "edit" | "rollback";
  status: string;
  error_code?: string;
  fix_attempts: number;
  input_tokens: number;
  output_tokens: number;
  cost_micros: number;
  preview_url?: string;
  created_at: string;
  finished_at?: string;
};

export type Page<T> = { items: T[]; next_cursor: string | null };
