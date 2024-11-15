import axios from 'axios';
import { FLASK_BASE_URL } from '@env';

const api = axios.create({
    baseURL: FLASK_BASE_URL,
});

export const parseReceipt = (imageFile) => {
    const formData = new FormData()
    formData.append('file', {
        uri: imageFile.uri,
        name: 'receipt.jpg',
        type: 'image/jpeg',
    });

    return api.post("/parse-receipt", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getFriendsList = () => api.get("/friends-list");

export const assignItems = (items, friends) => {
    api.post("/assign-items", { items, friends });
}

export const requestPayments = (assignedItems) => {
    api.post("/request-payments", { assignmed_items: assignedItems });
}

export default api;