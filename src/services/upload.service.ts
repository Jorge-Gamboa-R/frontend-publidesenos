import api from './api';

export const uploadService = {
  uploadCustomizationImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post<{ url: string; publicId: string }>('/upload/customization-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  uploadProductImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post<{ url: string; publicId: string }>('/upload/product-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};
