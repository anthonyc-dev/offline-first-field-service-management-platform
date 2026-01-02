// Form service for handling form submissions
import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export interface FormData {
  [key: string]: any;
}

export interface FormSubmission {
  formId: string;
  data: FormData;
  submittedAt: string;
  synced: boolean;
}

export class FormService {
  async submitForm(formId: string, data: FormData): Promise<FormSubmission> {
    // Submit form to server
    const response = await apiClient.post(API_ENDPOINTS.FORMS.SUBMIT(formId), {
      formId,
      data,
      submittedAt: new Date().toISOString(),
    });

    return response.data;
  }

  async getForms(): Promise<any[]> {
    const response = await apiClient.get(API_ENDPOINTS.FORMS.LIST);
    return response.data;
  }

  async getFormById(formId: string): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.FORMS.DETAIL(formId));
    return response.data;
  }
}

export const formService = new FormService();

