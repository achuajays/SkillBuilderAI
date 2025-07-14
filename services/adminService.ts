import { supabase } from './supabaseClient';
import { SecureApiKey, CreateApiKeyRequest, UpdateApiKeyRequest } from '../types/admin';

// Check if current user is admin
export const checkAdminStatus = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_admin', {
      user_id: (await supabase.auth.getUser()).data.user?.id
    });
    
    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get all API keys
export const getApiKeys = async (): Promise<SecureApiKey[]> => {
  const { data, error } = await supabase
    .from('secure_api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Create new API key
export const createApiKey = async (keyData: CreateApiKeyRequest): Promise<SecureApiKey> => {
  const { data, error } = await supabase
    .from('secure_api_keys')
    .insert({
      ...keyData,
      created_by: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update API key
export const updateApiKey = async (id: string, updates: UpdateApiKeyRequest): Promise<SecureApiKey> => {
  const { data, error } = await supabase
    .from('secure_api_keys')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete API key
export const deleteApiKey = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('secure_api_keys')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Toggle API key active status
export const toggleApiKeyStatus = async (id: string, isActive: boolean): Promise<SecureApiKey> => {
  return updateApiKey(id, { is_active: isActive });
};