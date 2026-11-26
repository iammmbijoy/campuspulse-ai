import axiosClient from './axiosClient';

// Fetch all incident tickets (filtered automatically by backend based on user role)
export const fetchTickets = async () => {
  const response = await axiosClient.get('/tickets/');
  return response.data;
};

// Create a new incident ticket (supports optional image upload via FormData)
export const createTicket = async ({ description, building, room_or_lab, imageFile }) => {
  const formData = new FormData();
  formData.append('description', description);
  if (building) formData.append('building', building);
  if (room_or_lab) formData.append('room_or_lab', room_or_lab);
  if (imageFile) formData.append('image', imageFile);

  const response = await axiosClient.post('/tickets/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};