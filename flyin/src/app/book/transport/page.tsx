'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/auth-store'
import { MapPin, Calendar, Users, DollarSign, Plane, Navigation } from 'lucide-react'
import { format } from 'date-fns'
// Helicopter selection moved to admin assignment workflow
import { getDistanceBetweenLocations, calculateTransportPrice, LOCATION_COORDINATES } from '@/lib/distance-calculator'

interface Airport {
  id: string
  code: string
  name: string
  city: string
}

export default function BookTransportPage() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    fromCustom: '',
    toCustom: '',
    date: '',
    time: '',
    returnDate: '',
    returnTime: '',
    passengers: 1,
    notes: '',
    isRoundTrip: false,
  })
  const [priceBredown, setPriceBreakdown] = useState<any>(null)

  useEffect(() => {
    fetchAirports()
  }, [])

  const fetchAirports = async () => {
    try {
      const { data, error } = await supabase
        .from('airports')
        .select('*')
        .order('name')

      if (data) setAirports(data)
      if (error) {
        console.error('Error fetching airports:', error)
        // Use demo airports if database is not connected
        setAirports([
          { id: '1', code: 'GUA', name: 'La Aurora International Airport', city: 'Guatemala City' },
          { id: '2', code: 'FRS', name: 'Mundo Maya International Airport', city: 'Flores' },
          { id: '3', code: 'PBR', name: 'Puerto Barrios Airport', city: 'Puerto Barrios' },
          { id: '4', code: 'RER', name: 'Retalhuleu Airport', city: 'Retalhuleu' },
        ])
      }
    } catch (err) {
      // Use demo airports if database is not connected
      setAirports([
        { id: '1', code: 'GUA', name: 'La Aurora International Airport', city: 'Guatemala City' },
        { id: '2', code: 'FRS', name: 'Mundo Maya International Airport', city: 'Flores' },
        { id: '3', code: 'PBR', name: 'Puerto Barrios Airport', city: 'Puerto Barrios' },
        { id: '4', code: 'RER', name: 'Retalhuleu Airport', city: 'Retalhuleu' },
      ])
    }
  }

  // Helicopter selection moved to admin workflow

  const calculatePrice = useCallback(() => {
    const fromLoc = formData.fromLocation === 'custom' ? formData.fromCustom.toUpperCase() : formData.fromLocation
    const toLoc = formData.toLocation === 'custom' ? formData.toCustom.toUpperCase() : formData.toLocation
    
    if (!fromLoc || !toLoc) {
      setPriceBreakdown(null)
      return 0
    }

    try {
      const distance = getDistanceBetweenLocations(fromLoc, toLoc)
      // Use standard rate since helicopter selection is now handled by admin
      const standardRate = 600 // Standard hourly rate for pricing estimates
      const pricing = calculateTransportPrice(distance, standardRate, formData.passengers)
      
      // Apply round trip multiplier (same day round trip is 1.8x, different day is 2x)
      if (formData.isRoundTrip && formData.date && formData.returnDate) {
        const departureDate = new Date(formData.date)
        const returnDate = new Date(formData.returnDate)
        const isSameDay = departureDate.toDateString() === returnDate.toDateString()
        const multiplier = isSameDay ? 1.8 : 2.0
        
        const roundTripPricing = {
          ...pricing,
          basePrice: Math.round(pricing.basePrice * multiplier),
          totalPrice: Math.round(pricing.totalPrice * multiplier),
          isRoundTrip: true,
          multiplier
        }
        
        setPriceBreakdown(roundTripPricing)
        return roundTripPricing.totalPrice
      }
      
      setPriceBreakdown(pricing)
      return pricing.totalPrice
    } catch (error) {
      console.error('Price calculation error:', error)
      setPriceBreakdown(null)
      return 0
    }
  }, [formData.fromLocation, formData.toLocation, formData.fromCustom, formData.toCustom, formData.passengers, formData.isRoundTrip, formData.date, formData.returnDate])

  const price = calculatePrice()

  useEffect(() => {
    // Only call calculatePrice on initial load and when dependencies actually change
    calculatePrice()
  }, [formData.fromLocation, formData.toLocation, formData.fromCustom, formData.toCustom, formData.passengers, formData.isRoundTrip, formData.date, formData.returnDate])

  const getLocationName = (code: string, customValue?: string) => {
    if (code === 'custom' && customValue) {
      return customValue
    }
    const airport = airports.find(a => a.code === code)
    if (airport) return airport.name
    const knownLocation = LOCATION_COORDINATES[code]
    if (knownLocation) return knownLocation.name
    return code
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user is logged in
    if (!profile?.id) {
      setError('Please log in to book a flight')
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?redirect=/book/transport')
      }, 2000)
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const fromLoc = formData.fromLocation === 'custom' ? formData.fromCustom : formData.fromLocation
      const toLoc = formData.toLocation === 'custom' ? formData.toCustom : formData.toLocation
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          client_id: profile.id,
          booking_type: 'transport',
          from_location: fromLoc,
          to_location: toLoc,
          scheduled_date: formData.date,
          scheduled_time: formData.time,
          return_date: formData.isRoundTrip ? formData.returnDate : null,
          return_time: formData.isRoundTrip ? formData.returnTime : null,
          is_round_trip: formData.isRoundTrip,
          passenger_count: formData.passengers,
          notes: formData.notes,
          total_price: calculatePrice(),
        })
        .select()

      if (error) throw error

      // Redirect to passenger details page with booking info
      const booking = data[0]
      const passengerDetailsUrl = `/book/passenger-details?booking_id=${booking.id}&passengers=${formData.passengers}&total_price=${calculatePrice()}&from=${encodeURIComponent(fromLoc)}&to=${encodeURIComponent(toLoc)}&date=${formData.date}&time=${formData.time}`
      
      setError('')
      router.push(passengerDetailsUrl)
    } catch (error: any) {
      setError(error.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-luxury-black text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Plane className="h-8 w-8 text-luxury-gold" />
            <span className="text-2xl font-bold">FlyInGuate</span>
          </Link>
          <div className="text-sm">
            Welcome, {profile?.full_name || profile?.email}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Direct Transport</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="card-luxury space-y-6">
            <h2 className="text-xl font-semibold flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary-600" />
              Route Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From
                </label>
                <select
                  value={formData.fromLocation}
                  onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select departure</option>
                  <optgroup label="Airports">
                    {airports.map((airport) => (
                      <option key={airport.id} value={airport.code}>
                        {airport.name} ({airport.code})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Popular Destinations">
                    <option value="ANTIGUA">Antigua Guatemala</option>
                    <option value="ATITLAN">Lake Atitlán</option>
                    <option value="TIKAL">Tikal National Park</option>
                    <option value="SEMUC">Semuc Champey</option>
                    <option value="MONTERRICO">Monterrico Beach</option>
                    <option value="LIVINGSTON">Livingston</option>
                  </optgroup>
                  <option value="custom">🗺️ Custom Location</option>
                </select>
                {formData.fromLocation === 'custom' && (
                  <input
                    type="text"
                    value={formData.fromCustom}
                    onChange={(e) => setFormData({ ...formData, fromCustom: e.target.value })}
                    className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter departure location"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <select
                  value={formData.toLocation}
                  onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select destination</option>
                  <optgroup label="Airports">
                    {airports.map((airport) => (
                      <option key={airport.id} value={airport.code}>
                        {airport.name} ({airport.code})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Popular Destinations">
                    <option value="ANTIGUA">Antigua Guatemala</option>
                    <option value="ATITLAN">Lake Atitlán</option>
                    <option value="TIKAL">Tikal National Park</option>
                    <option value="SEMUC">Semuc Champey</option>
                    <option value="MONTERRICO">Monterrico Beach</option>
                    <option value="LIVINGSTON">Livingston</option>
                  </optgroup>
                  <option value="custom">🗺️ Custom Location</option>
                </select>
                {formData.toLocation === 'custom' && (
                  <input
                    type="text"
                    value={formData.toCustom}
                    onChange={(e) => setFormData({ ...formData, toCustom: e.target.value })}
                    className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter destination"
                    required
                  />
                )}
              </div>
            </div>
          </div>


          <div className="card-luxury space-y-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary-600" />
              Schedule
            </h2>

            {/* Trip Type Toggle */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Trip Type:</span>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tripType"
                    checked={!formData.isRoundTrip}
                    onChange={() => setFormData({ ...formData, isRoundTrip: false, returnDate: '', returnTime: '' })}
                    className="mr-2"
                  />
                  <span className="text-sm">One Way</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tripType"
                    checked={formData.isRoundTrip}
                    onChange={() => setFormData({ ...formData, isRoundTrip: true })}
                    className="mr-2"
                  />
                  <span className="text-sm">Round Trip</span>
                </label>
              </div>
            </div>

            {/* Departure */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gray-800">
                {formData.isRoundTrip ? 'Departure' : 'Flight Details'}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Return - Only show if round trip */}
            {formData.isRoundTrip && (
              <div>
                <h3 className="text-lg font-medium mb-3 text-gray-800">Return</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      min={formData.date || format(new Date(), 'yyyy-MM-dd')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                    
                    {/* Same Day Quick Options */}
                    {formData.date && (
                      <div className="mt-2 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, returnDate: formData.date })}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Same Day
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextDay = new Date(formData.date)
                            nextDay.setDate(nextDay.getDate() + 1)
                            setFormData({ ...formData, returnDate: format(nextDay, 'yyyy-MM-dd') })
                          }}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                        >
                          Next Day
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Time
                    </label>
                    <input
                      type="time"
                      value={formData.returnTime}
                      onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                {/* Same Day Return Notice */}
                {formData.date && formData.returnDate && formData.date === formData.returnDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Same Day Return:</strong> 10% discount applied! Great for quick business trips or day tours.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card-luxury space-y-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary-600" />
              Passengers
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Passengers
              </label>
              <select
                value={formData.passengers}
                onChange={(e) => setFormData({ ...formData, passengers: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Any special requirements or preferences..."
              />
            </div>
          </div>

          <div className="card-luxury bg-primary-50 border-primary-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 text-primary-700 mr-2" />
                <span className="text-xl font-semibold text-primary-900">
                  Price Breakdown
                </span>
              </div>
              <span className="text-3xl font-bold text-primary-900">
                ${calculatePrice()}
              </span>
            </div>
            
            {priceBredown && (
              <div className="space-y-2 text-sm text-primary-800 mb-4">
                <div className="flex justify-between">
                  <span>Distance:</span>
                  <span>{priceBredown.distance} km {priceBredown.isRoundTrip ? '(each way)' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Flight Time:</span>
                  <span>{priceBredown.flightTime} minutes {priceBredown.isRoundTrip ? '(each way)' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>{priceBredown.isRoundTrip ? 'Base Price (One Way):' : 'Estimated Base Price:'}</span>
                  <span>${Math.round(priceBredown.basePrice / (priceBredown.multiplier || 1))}</span>
                </div>
                {priceBredown.isRoundTrip && (
                  <div className="flex justify-between">
                    <span>Round Trip Multiplier:</span>
                    <span>×{priceBredown.multiplier} {priceBredown.multiplier === 1.8 ? '(Same Day Discount)' : ''}</span>
                  </div>
                )}
                {priceBredown.passengerFee > 0 && (
                  <div className="flex justify-between">
                    <span>Additional Passengers:</span>
                    <span>+${priceBredown.passengerFee}</span>
                  </div>
                )}
                <div className="border-t border-primary-300 pt-2 flex justify-between font-semibold">
                  <span>Total {priceBredown.isRoundTrip ? 'Round Trip' : ''} Price:</span>
                  <span>${priceBredown.totalPrice}</span>
                </div>
              </div>
            )}

            <div className="flex items-center text-sm text-primary-700">
              <Navigation className="h-4 w-4 mr-2" />
              {formData.fromLocation && formData.toLocation ? (
                <span>
                  Route: {getLocationName(formData.fromLocation, formData.fromCustom)} → {getLocationName(formData.toLocation, formData.toCustom)}
                </span>
              ) : (
                <span>Select departure and destination to see pricing</span>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-luxury disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Book Flight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}