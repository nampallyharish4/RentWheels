import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import Card, { CardContent, CardHeader, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SearchableLocationSelect from '../ui/SearchableLocationSelect';
import { useBookingStore } from '../../store/bookingStore';
import { useVehicleStore } from '../../store/vehicleStore';
import { format, addDays, differenceInDays, isValid } from 'date-fns';
import type { BookingFormData } from '../../types';

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  isLoading?: boolean;
}

// List of locations
const locations = [
  'Banjara Hills',
  'Dilsukhnagar',
  'Koti',
  'Punjagutta',
  'Begumpet',
  'Jubilee Hills',
  'Mehdipatnam',
  'Ameerpet',
  'Abids',
  'A C Guards',
  'Abids Road',
  'Adarsh Nagar',
  'Adikmet',
  'Afzal Gunj',
  'Aghapura',
  'Ahmed Nagar',
  'Akbar Road',
  'Aliabad',
  'Amberpet',
  'Ameerpet X Road',
  'Anand Nagar Colony',
  'Ashok Nagar',
  'Asif Nagar',
  'Attapur',
  'Attapur Ring Road',
  'Auto Nagar',
  'Azamabad',
  'Bachpally',
  'Badi Chowdi',
  'Bagh Amberpet',
  'Bagh Lingampally',
  'Bahadurpura',
  'Bahadurpally',
  'Bairamalguda',
  'Bakaram',
  'Bala Nagar',
  'Balapur',
  'Balkampet',
  'Bandlaguda',
  'Bank Street',
  'Bansilal Pet',
  'Bansilalpet',
  'Bapuji Nagar',
  'Barkas',
  'Barkatpura',
  'Basheer Bagh',
  'Bazar Ghat',
  'Begum Bazaar',
  'Bhagya Nagar Colony',
  'Bharat Nagar',
  'BHEL',
  'Bholakpur',
  'BK Guda',
  'Boggulakunta',
  'Bollaram',
  'Borabanda',
  'Boyiguda',
  'Chaderghat',
  'Chaitanyapuri',
  'Champapet',
  'Chanchalguda',
  'Chanda Nagar',
  'Chandrayanagutta',
  'Chappal Bazaar',
  'Chapel Road',
  'Char Kaman',
  'Charminar',
  'Chatta Bazar',
  'Chikkadpalli',
  'Chilakalguda',
  'Chintal',
  'Chintal Basti',
  'Chintalkunta',
  'Chirag Ali Lane',
  'Chudi Bazaar',
  'D D Colony',
  'Dabeerpura',
  'Dabeerpura North',
  'Darus Salam',
  'Darulshifa',
  'Defence Colony',
  'Dharam Karan Road',
  'Diamond Point',
  'Dilshad Nagar',
  'Dilsukhnagar Main Road',
  'Domalguda',
  'Doodh Bowli',
  'Dwarkapuri Colony',
  'ECIL',
  'Edi Bazar North',
  'Erragadda',
  'Erramanzil',
  'Erramanzil Colony',
  'Esamiya Bazaar',
  'Falaknuma',
  'Fateh Darwaza',
  'Fateh Maidan',
  'Fathenagar',
  'Feelkhana',
  'Ferozguda',
  'Film Nagar',
  'Gachibowli',
  'Gaddi Annaram',
  'Gagan Mahal',
  'Gaghan Pahad',
  'Gandhi Nagar',
  'Gandhipet',
  'Gandhipet Road',
  'General Bazaar',
  'Ghansi Bazaar',
  'Golconda',
  'Golconda X Roads',
  'Gosha Mahal',
  'Gowliguda',
  'Gowliguda Chaman',
  'Greenlands',
  'Gudimalkapur',
  'Gudimalkapur New Po',
  'Gulzar House',
  'Gun Foundry',
  'Hafizpet',
  'Hakimpet',
  'Hanuman Tekdi',
  'Haribowli',
  'Hastinapuram',
  'Hayat Nagar',
  'Hitech City',
  'Hill Fort',
  'Hill Fort Road',
  'Himayat Nagar',
  'Himayat Sagar',
  'Hmt Road',
  'Humayun Nagar',
  'Hussaini Alam',
  'Hyder Nagar',
  'Hyderguda',
  'Ibrahim Bagh',
  'Ibrahimpatnam',
  'Inder Bagh',
  'Indira Park',
  'Jagadgiri Gutta',
  'Jagdish Market',
  'Jahanuma',
  'Jam Bagh',
  'Jamia Osmania',
  'Jawahar Nagar',
  'Jawaharlal Nehru Road',
  'Jeedimetla',
  'Kachiguda',
  'Kachiguda X Road',
  'Kakatiya Nagar',
  'Kalasiguda',
  'Kali Khabar',
  'Kali Kaman',
  'Kalyan Nagar',
  'Kamala Nagar',
  'Kamala Puri Colony',
  'Kamla Nagar',
  'Kanchan Bagh',
  'Karmanghat',
  'Karwan',
  'Katedan',
  'Kavadiguda',
  'Kesav Giri',
  'Khairatabad',
  'King Koti',
  'Kishan Bagh',
  'Kishan Gunj',
  'Kompally',
  'Kondapur',
  'Kothaguda',
  'Kothapet',
  'Kukatpally Housing Board Colony',
  'Krishna Nagar',
  'Kukatpally',
  'Kummari Guda',
  'Kundan Bagh',
  'LB Nagar',
  'LB Stadium',
  'Laad Bazaar',
  'Lakdikapul',
  'Lal Darwaza',
  'Langer House',
  'Liberty',
  'Lingampalli',
  'Lingampally',
  'Lower Tank Bund Road',
  'Machili Kaman',
  'Madannapet',
  'Madhapur',
  'Madhura Nagar',
  'Madina Colony',
  'Madinaguda',
  'Mahankali Street',
  'Maharaj Gunj',
  'Mahatma Gandhi Road',
  'Malakpet',
  'Mallapur',
  'Mallepally',
  'Mangalhat',
  'Mansoorabad X Road',
  'Maruti Colony',
  'Maruthi Nagar',
  'Masab Tank',
  'Meerpet',
  'Mehboob Ganj',
  'Minister Road',
  'Mir Alam Mandi',
  'Miyapur',
  'Moghalpura',
  'Moinabad',
  'Monda Market',
  'Moosabowli',
  'Moosapet',
  'Moosarambagh',
  'Moti Nagar',
  'Mozamjahi Market',
  'Murad Nagar',
  'Musheerabad',
  'Mylargadda',
  'Nagarjuna Hills',
  'Nagarjuna Sagar Road',
  'Nagole',
  'Nallagutta',
  'Nallakunta',
  'Namalagundu',
  'Nampally',
  'Nampally Station Road',
  'Narayanguda',
  'Nayapul Road',
  'Necklace Road',
  'Nehru Nagar',
  'New Boyiguda',
  'New Malakpet',
  'New Nagole',
  'New Nallakunta',
  'New Osmangunj',
  'Nimboliadda',
  'Nizam Shahi Road',
  'Nizampet',
  'Nizampet Road',
  'Noorkhan Bazaar',
  'Old Boyiguda',
  'Old Malakpet',
  'Old Topkhana',
  'Osman Shahi',
  'Osmangunj',
  'Osmania University',
  'P&T Colony',
  'Padma Rao Nagar',
  'Pan Bazar',
  'Panjagutta',
  'Paradise',
  'Paradise Circle',
  'Patancheru',
  'Patel Market',
  'Pathargatti',
  'Penderghast Road',
  'Pragathi Nagar',
  'Prakash Nagar',
  'Prasanth Nagar',
  'Purana Pul',
  'Purani Haveli',
  'Putlibowli',
  'Quthbullapur',
  'RR District',
  'Raj Bhavan Road',
  'Rajendra Nagar',
  'Ram Nagar',
  'Ram Nagar Cross Road',
  'Ramachandra Puram',
  'Ramakrishnapuram',
  'Ramakrishnapuram Road',
  'Ramanthapur',
  'Ramgopalpet',
  'Ramkote',
  'Ramnagar Gundu',
  'Ranga Reddy Nagar',
  'Rani Gunj',
  'Rashtrapathi Road',
  'Rasoolpura',
  'Red Hills',
  'Regimental Bazaar',
  'Rethibowli',
  'Risala Bazar',
  'RTC Colony',
  'RTC X Road',
  'S R Nagar',
  'Sagar Road',
  'Saidabad',
  'Saifabad',
  'Saleem Nagar',
  'Sanath Nagar',
  'Santosh Nagar',
  'Saroor Nagar',
  'Secretariat',
  'Sitaram Bagh',
  'Serilingampally',
  'Shah Ali Banda',
  'Shahpur Nagar',
  'Shaikpet',
  'Shamshabad',
  'Shamsher Gunj',
  'Shanker Mutt',
  'Shanti Nagar',
  'Shapur Nagar',
  'Shivaji Nagar',
  'Shivam Road',
  'Shivarampally',
  'Siddarth Nagar',
  'Siddiamber Bazaar',
  'Sindhi Colony',
  'Sitaphal Mandi',
  'Somajiguda',
  'Somajiguda Circle',
  'Sri Krishna Nagar',
  'Sri Nagar',
  'Srinagar Colony',
  'Srinagar Colony Main Road',
  'Srinivasa Nagar',
  'Sultan Bazaar',
  'Talab Katta',
  'Tank Bund',
  'Tank Bund Road',
  'Tara Nagar',
  'Tarnaka',
  'Tilak Nagar',
  'Tilak Road',
  'Toli Chowki',
  'Troop Bazaar',
  'Uppuguda',
  'Vanasthalipuram',
  'Vasavi Nagar',
  'Vengal Rao Nagar',
  'Venkatapuram',
  'Vidya Nagar',
  'Vijaya Nagar Colony',
  'Vikas Nagar',
  'Vinayakarao Nagar',
  'Vittalwadi',
  'Warasiguda',
  'Yakutpura',
  'Yellareddyguda',
  'Yusuf Bazar',
  'Yousufguda',
  'Zamistanpur',
];

export function BookingForm({ onSubmit, isLoading = false }: BookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<BookingFormData>();

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Start Date"
        id="startDate"
        type="date"
        min={today}
        {...register('startDate', { required: 'Start date is required' })}
        error={errors.startDate?.message}
      />

      <Input
        label="End Date"
        id="endDate"
        type="date"
        min={today}
        {...register('endDate', { required: 'End date is required' })}
        error={errors.endDate?.message}
      />

      <SearchableLocationSelect
        label="Pickup Address"
        id="pickupAddress"
        options={locations}
        placeholder="Enter pickup location"
        name="pickupAddress"
        control={control}
        error={errors.pickupAddress?.message}
      />

      <SearchableLocationSelect
        label="Drop-off Address"
        id="dropoffAddress"
        options={locations}
        placeholder="Enter drop-off location"
        name="dropoffAddress"
        control={control}
        error={errors.dropoffAddress?.message}
      />

      <Button type="submit" disabled={isLoading} fullWidth>
        {isLoading ? 'Processing...' : 'Book Now'}
      </Button>
    </form>
  );
}

const BookingFormComponent: React.FC = () => {
  const navigate = useNavigate();
  const { selectedVehicle } = useVehicleStore();
  const { setBookingFormData, vehicleId, createBooking } = useBookingStore();

  const today = new Date();
  const tomorrow = addDays(today, 1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    control,
  } = useForm<BookingFormData>({
    defaultValues: {
      startDate: format(today, 'yyyy-MM-dd'),
      endDate: format(tomorrow, 'yyyy-MM-dd'),
      pickupAddress: '',
      dropoffAddress: '',
    },
  });

  // Add state for booking submission loading
  const [isBookingLoading, setIsBookingLoading] = React.useState(false);
  // Add state for booking error message
  const [bookingError, setBookingError] = React.useState<string | null>(null);

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Calculate days and total price
  let days = 0;
  let totalPrice = 0;
  let isDateRangeValid = false;
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  if (
    selectedVehicle &&
    isValid(startDateObj) &&
    isValid(endDateObj) &&
    endDateObj > startDateObj
  ) {
    days = differenceInDays(endDateObj, startDateObj);
    if (days === 0) days = 1; // Minimum 1 day rental
    totalPrice = days * selectedVehicle.dailyRate;
    isDateRangeValid = true;
  } else if (
    selectedVehicle &&
    isValid(startDateObj) &&
    isValid(endDateObj) &&
    startDate === endDate
  ) {
    // Handle same day booking as 1 day
    days = 1;
    totalPrice = days * selectedVehicle.dailyRate;
    isDateRangeValid = true;
  }

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedVehicle || !vehicleId) {
      navigate('/vehicles');
      return;
    }

    setBookingFormData(data);
    setIsBookingLoading(true); // Set loading to true on submission start
    // Clear previous errors
    setBookingError(null);

    try {
      const bookingId = await createBooking(
        data,
        vehicleId,
        selectedVehicle.dailyRate
      );
      // Navigate to payment page on success
      navigate(`/booking/payment/${bookingId}`);
    } catch (error) {
      console.error('Failed to create booking', error);
      // Set the error message to display to the user
      setBookingError((error as Error).message);
    } finally {
      setIsBookingLoading(false); // Set loading to false when submission is complete
    }
  };

  if (!selectedVehicle) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold text-secondary-900">
          Booking Details
        </h2>
        <p className="text-secondary-600 text-sm">
          {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year}
          )
        </p>
      </CardHeader>

      <CardContent>
        {/* Display booking error if it exists */}
        {bookingError && (
          <div className="text-red-500 text-sm mb-4">{bookingError}</div>
        )}
        {/* Pass the new loading state to BookingForm */}
        <BookingForm
          onSubmit={onSubmit}
          isLoading={isBookingLoading || !isDateRangeValid}
        />
      </CardContent>
    </Card>
  );
};

export default BookingFormComponent;
