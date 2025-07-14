export interface SecureApiKey {
  id: string;
  key_name: string;
  api_key: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateApiKeyRequest {
  key_name: string;
  api_key: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateApiKeyRequest {
  api_key?: string;
  description?: string;
  is_active?: boolean;
}