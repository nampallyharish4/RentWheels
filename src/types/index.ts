export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  type: 'car' | 'bike';
  category: string;
  description: string;
  imageUrl: string;
  available: boolean;
  ownerId: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  fuelType: string;
  transmission: string;
  seats: number;
  doors: number;
}

export interface Booking {
  id: string;
  vehicleId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  ownerDecision?: 'pending' | 'accepted' | 'rejected';
  pickupAddress: string;
  dropoffAddress: string;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle?: Pick<Vehicle, 'make' | 'model' | 'year' | 'imageUrl'>;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: 'credit_card' | 'debit_card' | 'upi' | 'cash';
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  emailConfirmed: boolean;
}

export type CategoryType =
  | 'sedan'
  | 'suv'
  | 'luxury'
  | 'compact'
  | 'pickup'
  | 'minivan'
  | 'convertible'
  | 'electric';

export interface BookingFormData {
  startDate: string;
  endDate: string;
  pickupAddress: string;
  dropoffAddress: string;
}

export interface PaymentFormData {
  paymentMethod: 'credit_card' | 'debit_card' | 'upi';
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  upiId?: string;
}
