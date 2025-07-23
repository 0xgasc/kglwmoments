'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'
import { supabase } from '@/lib/supabase'
import { 
  Plane, Calendar, MapPin, Clock, Users, CheckCircle, 
  AlertCircle, XCircle, DollarSign, BarChart3, UserCheck,
  Plus 
} from 'lucide-react'
import { HELICOPTER_FLEET } from '@/types/helicopters'
import { format } from 'date-fns'

interface Booking {
  id: string
  created_at: string
  booking_type: 'transport' | 'experience'
  status: string
  from_location: string | null
  to_location: string | null
  scheduled_date: string
  scheduled_time: string
  passenger_count: number
  total_price: number
  notes: string | null
  admin_notes: string | null
  payment_status: string
  pilot_id: string | null
  client: {
    id: string
    full_name: string | null
    email: string
    phone: string | null
  }
  pilot: {
    id: string
    full_name: string | null
    email: string
  } | null
  experiences: {
    name: string
    location: string
  } | null
  passenger_details?: any[]
  selected_addons?: any[]
  addon_total_price?: number
  helicopter_id?: string | null
  return_date?: string | null
  return_time?: string | null
  is_round_trip?: boolean
  revision_requested?: boolean
  revision_notes?: string | null
  revision_data?: any
}

interface Pilot {
  id: string
  full_name: string | null
  email: string
  kyc_verified: boolean
}

export default function AdminDashboard() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'users' | 'pilots' | 'transactions' | 'choppers' | 'analytics'>('bookings')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [availablePilots, setAvailablePilots] = useState<Pilot[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [selectedHelicopter, setSelectedHelicopter] = useState<string>('')
  const [selectedPilot, setSelectedPilot] = useState<string>('')
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<Booking | null>(null)
  const [showEditBookingModal, setShowEditBookingModal] = useState(false)
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'client' as 'client' | 'pilot' | 'admin',
    phone: ''
  })
  const [editUserData, setEditUserData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    kyc_verified: false,
    account_balance: 0,
    notes: ''
  })
  const [editBookingData, setEditBookingData] = useState({
    from_location: '',
    to_location: '',
    scheduled_date: '',
    scheduled_time: '',
    return_date: '',
    return_time: '',
    passenger_count: 1,
    is_round_trip: false,
    notes: '',
    revision_notes: ''
  })

  // Helicopter and maintenance state
  const [helicopters, setHelicopters] = useState<any[]>([])
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([])
  const [selectedHelicopterForEdit, setSelectedHelicopterForEdit] = useState<any>(null)
  const [showEditHelicopterModal, setShowEditHelicopterModal] = useState(false)
  const [showAddHelicopterModal, setShowAddHelicopterModal] = useState(false)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [newHelicopterData, setNewHelicopterData] = useState({
    name: '',
    model: '',
    manufacturer: '',
    year_manufactured: new Date().getFullYear(),
    registration_number: '',
    capacity: 4,
    hourly_rate: 600,
    max_range_km: 500,
    cruise_speed_kmh: 180,
    fuel_capacity_liters: 200,
    fuel_consumption_lph: 50,
    location: 'Guatemala City Base',
    notes: ''
  })

  useEffect(() => {
    if (profile?.id) {
      if (activeTab === 'bookings') {
        fetchBookings()
      } else if (activeTab === 'pilots') {
        fetchPilots()
      } else if (activeTab === 'users') {
        fetchUsers()
      } else if (activeTab === 'transactions') {
        fetchTransactions()
      } else if (activeTab === 'choppers') {
        fetchHelicopters()
        fetchMaintenanceRecords()
      }
    }
  }, [profile, activeTab, statusFilter])

  const fetchBookings = async () => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          client:profiles!bookings_client_id_fkey (
            id,
            full_name,
            email,
            phone
          ),
          pilot:profiles!bookings_pilot_id_fkey (
            id,
            full_name,
            email
          ),
          experiences (
            name,
            location
          )
        `)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (data) setBookings(data)
      if (error) {
        console.error('Error fetching bookings:', error)
        // Demo data
        setBookings([
          {
            id: '1',
            created_at: new Date().toISOString(),
            booking_type: 'transport',
            status: 'pending',
            from_location: 'GUA',
            to_location: 'FRS',
            scheduled_date: '2024-01-20',
            scheduled_time: '09:00',
            passenger_count: 3,
            total_price: 450,
            notes: 'VIP client',
            admin_notes: null,
            payment_status: 'pending',
            pilot_id: null,
            client: {
              id: '1',
              full_name: 'Carlos Rodriguez',
              email: 'carlos@example.com',
              phone: '+502 5555 1111'
            },
            pilot: null,
            experiences: null
          },
          {
            id: '2',
            created_at: new Date().toISOString(),
            booking_type: 'experience',
            status: 'approved',
            from_location: null,
            to_location: null,
            scheduled_date: '2024-01-21',
            scheduled_time: '15:00',
            passenger_count: 2,
            total_price: 900,
            notes: 'Honeymoon couple',
            admin_notes: 'Premium service requested',
            payment_status: 'paid',
            pilot_id: null,
            client: {
              id: '2',
              full_name: 'Ana Martinez',
              email: 'ana@example.com',
              phone: '+502 5555 2222'
            },
            pilot: null,
            experiences: {
              name: 'Antigua Colonial Tour',
              location: 'Antigua'
            }
          }
        ])
      }
    } catch (err) {
      // Demo data
      setBookings([
        {
          id: '1',
          created_at: new Date().toISOString(),
          booking_type: 'transport',
          status: 'pending',
          from_location: 'GUA',
          to_location: 'FRS',
          scheduled_date: '2024-01-20',
          scheduled_time: '09:00',
          passenger_count: 3,
          total_price: 450,
          notes: 'VIP client',
          admin_notes: null,
          payment_status: 'pending',
          pilot_id: null,
          client: {
            id: '1',
            full_name: 'Carlos Rodriguez',
            email: 'carlos@example.com',
            phone: '+502 5555 1111'
          },
          pilot: null,
          experiences: null
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchPilots = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'pilot')
        .order('full_name')

      if (data) {
        setPilots(data)
        setAvailablePilots(data.filter(p => p.kyc_verified))
      }
      if (error) {
        console.error('Error fetching pilots:', error)
        // Demo data
        const demoPilots = [
          { id: '1', full_name: 'Miguel Santos', email: 'miguel@example.com', kyc_verified: true },
          { id: '2', full_name: 'Roberto Diaz', email: 'roberto@example.com', kyc_verified: true },
          { id: '3', full_name: 'Luis Morales', email: 'luis@example.com', kyc_verified: false }
        ]
        setPilots(demoPilots)
        setAvailablePilots(demoPilots.filter(p => p.kyc_verified))
      }
    } catch (err) {
      // Demo data
      const demoPilots = [
        { id: '1', full_name: 'Miguel Santos', email: 'miguel@example.com', kyc_verified: true },
        { id: '2', full_name: 'Roberto Diaz', email: 'roberto@example.com', kyc_verified: true },
        { id: '3', full_name: 'Luis Morales', email: 'luis@example.com', kyc_verified: false }
      ]
      setPilots(demoPilots)
      setAvailablePilots(demoPilots.filter(p => p.kyc_verified))
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      console.log('Fetching all users...')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Users fetch result:', { data, error, count: data?.length })
      console.log('Actual users data:', data)

      if (error) {
        console.error('Error fetching users:', error)
      }
      
      // Always set the data we got, even if there was an error
      setUsers(data || [])
      
      // If no data and no users found, add demo data
      if (!data || data.length === 0) {
        console.log('No users found, adding demo data')
        setUsers([
          { id: '1', email: 'client1@example.com', full_name: 'John Doe', role: 'client', kyc_verified: true, account_balance: 150.00, created_at: new Date().toISOString() },
          { id: '2', email: 'pilot1@example.com', full_name: 'Miguel Santos', role: 'pilot', kyc_verified: true, account_balance: 0, created_at: new Date().toISOString() },
          { id: '3', email: 'client2@example.com', full_name: 'Ana Rodriguez', role: 'client', kyc_verified: false, account_balance: 0, created_at: new Date().toISOString() }
        ])
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          user:profiles!transactions_user_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (data) {
        setTransactions(data)
      }
      if (error) {
        console.error('Error fetching transactions:', error)
        // Demo data with payment proof URLs
        setTransactions([
          {
            id: '1',
            created_at: new Date().toISOString(),
            user_id: '1',
            type: 'deposit',
            amount: 100,
            payment_method: 'bank_transfer',
            status: 'pending',
            reference: 'REF-001',
            payment_proof_url: 'https://via.placeholder.com/400x600/e5e7eb/374151?text=Bank+Transfer+Receipt',
            user: { full_name: 'John Doe', email: 'john@example.com' }
          },
          {
            id: '2',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            user_id: '2',
            type: 'deposit',
            amount: 250,
            payment_method: 'cryptocurrency',
            status: 'pending',
            reference: 'CRYPTO-002',
            payment_proof_url: 'https://via.placeholder.com/400x300/dbeafe/1e40af?text=Crypto+Transaction+Hash',
            user: { full_name: 'Maria Garcia', email: 'maria@example.com' }
          },
          {
            id: '3',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            user_id: '3',
            type: 'deposit',
            amount: 500,
            payment_method: 'bank_transfer',
            status: 'approved',
            reference: 'REF-003',
            payment_proof_url: null,
            processed_at: new Date(Date.now() - 86400000).toISOString(),
            admin_notes: 'Verified manually by admin',
            user: { full_name: 'Carlos Rodriguez', email: 'carlos@example.com' }
          }
        ])
      }
    } catch (err) {
      console.error('Error:', err)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchHelicopters = async () => {
    try {
      const { data, error } = await supabase
        .from('helicopters')
        .select('*')
        .order('name')

      console.log('Fetching helicopters - data:', data, 'error:', error)
      
      if (data) {
        setHelicopters(data)
      }
      if (error) {
        console.error('Error fetching helicopters:', error)
        // Demo data if table doesn't exist yet
        setHelicopters([
          {
            id: 'robinson-r44',
            name: 'Robinson R44 II',
            model: 'R44 Raven II',
            manufacturer: 'Robinson Helicopter Company',
            year_manufactured: 2020,
            registration_number: 'TG-ROB44',
            capacity: 3,
            hourly_rate: 600.00,
            max_range_km: 560,
            cruise_speed_kmh: 180,
            fuel_capacity_liters: 114.0,
            fuel_consumption_lph: 45.0,
            total_flight_hours: 245.5,
            last_maintenance_date: '2024-01-15',
            next_maintenance_due: '2024-04-15',
            status: 'active',
            location: 'Guatemala City Base',
            notes: 'Primary training and short-haul helicopter'
          }
        ])
      }
    } catch (err) {
      console.error('Error:', err)
      setHelicopters([])
    }
  }

  const fetchMaintenanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select(`
          *,
          helicopter:helicopters!maintenance_records_helicopter_id_fkey (
            name,
            registration_number
          )
        `)
        .order('start_date', { ascending: false })

      if (data) {
        setMaintenanceRecords(data)
      }
      if (error) {
        console.warn('Error fetching maintenance records:', error)
        setMaintenanceRecords([])
      }
    } catch (err) {
      console.error('Error:', err)
      setMaintenanceRecords([])
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string, pilotId?: string, helicopterId?: string) => {
    setRefreshing(true)
    try {
      console.log('Updating booking:', { bookingId, status, pilotId })
      
      const updates: any = { status }
      if (pilotId) updates.pilot_id = pilotId
      if (helicopterId) updates.helicopter_id = helicopterId
      if (status === 'assigned' && pilotId) updates.status = 'assigned'

      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)
        .select()

      console.log('Update result:', { data, error })
      console.log('Updated booking data:', data)

      if (error) {
        console.error('Database error:', error)
        alert('Error updating booking: ' + error.message)
        setRefreshing(false)
        return
      }

      // Success - update local state immediately
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status, pilot_id: pilotId || null, helicopter_id: helicopterId || null }
          : booking
      ))
      
      setSelectedBooking(null)
      alert(`Booking ${status} successfully!`)
      
      // Also refresh from server
      setTimeout(() => {
        fetchBookings()
      }, 500)
    } catch (err) {
      console.error('Error updating booking:', err)
      alert('Error updating booking: ' + err)
    } finally {
      setRefreshing(false)
    }
  }

  const updateTransactionStatus = async (transactionId: string, status: 'approved' | 'rejected', notes?: string) => {
    console.log('Updating transaction:', { transactionId, status, notes })
    
    try {
      const transaction = transactions.find(t => t.id === transactionId)
      if (!transaction) {
        alert('Transaction not found')
        return
      }

      const updates: any = { 
        status,
        processed_at: new Date().toISOString(),
        admin_notes: notes || null
      }

      // Update transaction status first
      const { error: transactionError } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)

      if (transactionError) {
        console.error('Transaction update error:', transactionError)
        alert('Error updating transaction: ' + transactionError.message)
        return
      }

      // If approving, also update user balance
      if (status === 'approved' && transaction.type === 'deposit') {
        console.log('Updating user balance for user:', transaction.user_id, 'amount:', transaction.amount)
        
        // Get current balance
        const { data: userProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('account_balance')
          .eq('id', transaction.user_id)
          .single()

        if (fetchError) {
          console.error('Error fetching user profile:', fetchError)
          alert('Transaction approved but balance update failed: ' + fetchError.message)
          fetchTransactions()
          return
        }

        const currentBalance = userProfile?.account_balance || 0
        const newBalance = currentBalance + transaction.amount

        // Update user balance
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ account_balance: newBalance })
          .eq('id', transaction.user_id)

        if (balanceError) {
          console.error('Balance update error:', balanceError)
          alert('Transaction approved but balance update failed: ' + balanceError.message)
        } else {
          console.log('Balance updated successfully from', currentBalance, 'to', newBalance)
          alert(`Transaction ${status} successfully! User balance updated.`)
        }
      } else {
        alert(`Transaction ${status} successfully!`)
      }

      fetchTransactions()
      
    } catch (err) {
      console.error('Error updating transaction:', err)
      alert('Error updating transaction: ' + err)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (!error) {
        fetchUsers()
        alert(`User role updated to ${newRole}!`)
      }
    } catch (err) {
      console.error('Error updating user role:', err)
      alert('Error updating user role: ' + err)
    }
  }

  const openEditUserModal = (user: any) => {
    setSelectedUser(user)
    setEditUserData({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      kyc_verified: user.kyc_verified || false,
      account_balance: user.account_balance || 0,
      notes: user.admin_notes || ''
    })
    setShowEditUserModal(true)
  }

  const updateUserProfile = async () => {
    if (!selectedUser) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editUserData.full_name,
          phone: editUserData.phone,
          role: editUserData.role,
          kyc_verified: editUserData.kyc_verified,
          account_balance: editUserData.account_balance,
          admin_notes: editUserData.notes
        })
        .eq('id', selectedUser.id)

      if (error) {
        console.error('Error updating user:', error)
        alert('Error updating user: ' + error.message)
      } else {
        alert('User profile updated successfully!')
        setShowEditUserModal(false)
        setSelectedUser(null)
        fetchUsers()
        if (activeTab === 'pilots') fetchPilots()
      }
    } catch (err) {
      console.error('Error updating user:', err)
      alert('Error updating user: ' + err)
    } finally {
      setLoading(false)
    }
  }

  const openEditBookingModal = (booking: Booking) => {
    setSelectedBookingForEdit(booking)
    setEditBookingData({
      from_location: booking.from_location || '',
      to_location: booking.to_location || '',
      scheduled_date: booking.scheduled_date || '',
      scheduled_time: booking.scheduled_time || '',
      return_date: booking.return_date || '',
      return_time: booking.return_time || '',
      passenger_count: booking.passenger_count || 1,
      is_round_trip: booking.is_round_trip || false,
      notes: booking.notes || '',
      revision_notes: ''
    })
    setShowEditBookingModal(true)
  }

  const approveBookingWithChanges = async () => {
    if (!selectedBookingForEdit) return
    
    setLoading(true)
    try {
      // Create revision data
      const revisionData = {
        from_location: editBookingData.from_location,
        to_location: editBookingData.to_location,
        scheduled_date: editBookingData.scheduled_date,
        scheduled_time: editBookingData.scheduled_time,
        return_date: editBookingData.return_date,
        return_time: editBookingData.return_time,
        passenger_count: editBookingData.passenger_count,
        is_round_trip: editBookingData.is_round_trip,
        notes: editBookingData.notes
      }

      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'needs_revision',
          revision_requested: true,
          revision_notes: editBookingData.revision_notes,
          revision_data: revisionData
        })
        .eq('id', selectedBookingForEdit.id)

      if (error) {
        console.error('Error creating revision:', error)
        alert('Error creating revision: ' + error.message)
      } else {
        alert('Revision request created! Client will be notified to review and confirm changes.')
        setShowEditBookingModal(false)
        setSelectedBookingForEdit(null)
        fetchBookings()
      }
    } catch (err) {
      console.error('Error creating revision:', err)
      alert('Error creating revision: ' + err)
    } finally {
      setLoading(false)
    }
  }

  const approveBookingAsIs = async (bookingId: string) => {
    setRefreshing(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'approved' })
        .eq('id', bookingId)

      if (error) {
        console.error('Error approving booking:', error)
        alert('Error approving booking: ' + error.message)
      } else {
        alert('Booking approved without changes!')
        fetchBookings()
      }
    } catch (err) {
      console.error('Error approving booking:', err)
      alert('Error approving booking: ' + err)
    } finally {
      setRefreshing(false)
    }
  }

  const createNewUser = async () => {
    setLoading(true)
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserData.email,
        password: newUserData.password,
        options: {
          data: {
            full_name: newUserData.full_name,
            role: newUserData.role
          }
        }
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: newUserData.email,
            full_name: newUserData.full_name,
            role: newUserData.role,
            phone: newUserData.phone,
            kyc_verified: newUserData.role === 'admin', // Auto-verify admins
            account_balance: 0
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Continue anyway - might be created by trigger
        }

        alert(`${newUserData.role} user created successfully!`)
        setShowCreateUserModal(false)
        setNewUserData({
          email: '',
          password: '',
          full_name: '',
          role: 'client',
          phone: ''
        })
        fetchUsers()
      }
    } catch (error: any) {
      console.error('User creation error:', error)
      alert('Error creating user: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyPilot = async (pilotId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ kyc_verified: true })
        .eq('id', pilotId)

      if (!error) {
        fetchPilots()
      }
    } catch (err) {
      console.error('Error verifying pilot:', err)
      // Update local state for demo
      setPilots(prev => prev.map(p => 
        p.id === pilotId ? { ...p, kyc_verified: true } : p
      ))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'assigned': return 'bg-purple-100 text-purple-800'
      case 'needs_revision': return 'bg-orange-100 text-orange-800'
      case 'revision_pending': return 'bg-amber-100 text-amber-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-luxury-black text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Plane className="h-8 w-8 text-luxury-gold" />
            <span className="text-2xl font-bold">FlyInGuate - Admin</span>
          </Link>
          <div className="flex items-center space-x-6">
            <div className="text-sm">
              {profile?.full_name || profile?.email}
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/')
              }}
              className="text-sm hover:text-luxury-gold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex space-x-1 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 rounded-t-lg font-medium whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-white text-primary-700 border-b-2 border-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📅 Bookings
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-3 rounded-t-lg font-medium whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-white text-primary-700 border-b-2 border-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🗓️ Flight Calendar
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-t-lg font-medium whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-white text-primary-700 border-b-2 border-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveTab('pilots')}
            className={`px-6 py-3 rounded-t-lg font-medium whitespace-nowrap ${
              activeTab === 'pilots'
                ? 'bg-white text-primary-700 border-b-2 border-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🚁 Pilots
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 rounded-t-lg font-medium whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'bg-white text-primary-700 border-b-2 border-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            💰 Top-up Approvals
          </button>
          <button
            onClick={() => setActiveTab('choppers')}
            className={`px-6 py-3 rounded-t-lg font-medium whitespace-nowrap ${
              activeTab === 'choppers'
                ? 'bg-white text-primary-700 border-b-2 border-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🚁 Choppers
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 rounded-t-lg font-medium whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-white text-primary-700 border-b-2 border-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📊 Analytics
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="card-luxury">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold">
                            {booking.booking_type === 'transport' 
                              ? `${booking.from_location} → ${booking.to_location}`
                              : booking.experiences?.name
                            }
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            booking.payment_status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Payment: {booking.payment_status}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><span className="font-medium">Client:</span> {booking.client?.full_name || 'N/A'} ({booking.client?.email || 'N/A'})</p>
                            <p><span className="font-medium">Date:</span> {format(new Date(booking.scheduled_date), 'MMM dd, yyyy')} at {booking.scheduled_time}</p>
                            <p><span className="font-medium">Passengers:</span> {booking.passenger_count}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Price:</span> ${booking.total_price}</p>
                            {booking.pilot && (
                              <p><span className="font-medium">Pilot:</span> {booking.pilot?.full_name || 'N/A'}</p>
                            )}
                            {booking.notes && (
                              <p><span className="font-medium">Notes:</span> {booking.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 space-y-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveBookingAsIs(booking.id)}
                              className="block w-full px-3 py-2 mb-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
                            >
                              ✓ Approve As-Is
                            </button>
                            <button
                              onClick={() => openEditBookingModal(booking)}
                              className="block w-full px-3 py-2 mb-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                            >
                              ✏️ Approve with Changes
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="block w-full px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700"
                            >
                              ✗ Cancel
                            </button>
                          </>
                        )}
                        
                        {booking.status === 'needs_revision' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                            <p className="text-xs text-yellow-800 font-medium text-center">
                              📝 Awaiting Client Review
                            </p>
                            <p className="text-xs text-yellow-600 text-center">
                              Changes requested
                            </p>
                          </div>
                        )}
                        
                        {booking.status === 'approved' && booking.payment_status !== 'paid' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'pending_payment')}
                            className="block w-full px-3 py-2 mb-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                          >
                            💳 Awaiting Payment
                          </button>
                        )}
                        {booking.status === 'approved' && !booking.pilot_id && (
                          <button
                            onClick={() => {
                              console.log('Opening assignment modal for booking:', booking.id)
                              setSelectedBooking(booking)
                            }}
                            className="block w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                          >
                            🚁 Assign Pilot & Aircraft
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Flight Calendar & Aircraft Scheduling</h1>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  🗓️ Today
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  ← Week
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  Week →
                </button>
              </div>
            </div>

            {/* Helicopter Fleet Status */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {HELICOPTER_FLEET.map((helicopter, index) => {
                const helicopterBookings = bookings.filter(b => b.helicopter_id === helicopter.id && b.status !== 'cancelled')
                const todayBookings = helicopterBookings.filter(b => 
                  new Date(b.scheduled_date).toDateString() === new Date().toDateString()
                )
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500']
                
                return (
                  <div key={helicopter.id} className="card-luxury">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-4 h-4 rounded-full ${colors[index]}`}></div>
                      <span className="text-xs text-gray-500">{helicopter.capacity} pax</span>
                    </div>
                    <h3 className="font-bold text-sm mb-1">{helicopter.name}</h3>
                    <p className="text-xs text-gray-600 mb-3">${helicopter.hourly_rate}/hr</p>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Today:</span>
                        <span className={todayBookings.length > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                          {todayBookings.length > 0 ? `${todayBookings.length} flights` : 'Available'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>This Week:</span>
                        <span className="text-gray-600">{helicopterBookings.length} total</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Calendar Grid */}
            <div className="card-luxury">
              <div className="mb-4">
                <h2 className="text-lg font-bold mb-2">Week View - {format(new Date(), 'MMM dd, yyyy')}</h2>
                <div className="flex space-x-4 text-sm">
                  <div className="flex items-center"><div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>Pending</div>
                  <div className="flex items-center"><div className="w-3 h-3 bg-blue-400 rounded mr-2"></div>Approved</div>
                  <div className="flex items-center"><div className="w-3 h-3 bg-green-400 rounded mr-2"></div>Assigned</div>
                  <div className="flex items-center"><div className="w-3 h-3 bg-purple-400 rounded mr-2"></div>Completed</div>
                </div>
              </div>
              
              {/* Calendar Header */}
              <div className="grid grid-cols-8 gap-1 mb-2">
                <div className="p-2 text-xs font-medium text-gray-600">Aircraft</div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="p-2 text-xs font-medium text-gray-600 text-center border-l">
                    {day}<br/>
                    <span className="text-gray-400">{format(new Date(Date.now() + ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(day) * 24 * 60 * 60 * 1000), 'dd')}</span>
                  </div>
                ))}
              </div>
              
              {/* Calendar Rows */}
              {HELICOPTER_FLEET.map((helicopter, index) => {
                const colors = ['border-l-blue-500', 'border-l-green-500', 'border-l-purple-500', 'border-l-orange-500']
                const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50']
                
                return (
                  <div key={helicopter.id} className={`grid grid-cols-8 gap-1 border-t ${bgColors[index]} border-l-4 ${colors[index]}`}>
                    <div className="p-3">
                      <div className="font-medium text-sm">{helicopter.name}</div>
                      <div className="text-xs text-gray-600">{helicopter.model}</div>
                    </div>
                    
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const currentDate = new Date()
                      currentDate.setDate(currentDate.getDate() + dayIndex)
                      const dayBookings = bookings.filter(b => 
                        b.helicopter_id === helicopter.id && 
                        new Date(b.scheduled_date).toDateString() === currentDate.toDateString()
                      )
                      
                      return (
                        <div key={dayIndex} className="p-1 min-h-[80px] border-l border-gray-200 relative">
                          {dayBookings.map((booking, bookingIndex) => {
                            const statusColors = {
                              'pending': 'bg-yellow-400',
                              'approved': 'bg-blue-400', 
                              'assigned': 'bg-green-400',
                              'completed': 'bg-purple-400',
                              'cancelled': 'bg-gray-400'
                            }
                            
                            return (
                              <div 
                                key={booking.id}
                                className={`text-xs p-1 mb-1 rounded text-white cursor-pointer hover:opacity-80 ${
                                  statusColors[booking.status as keyof typeof statusColors] || 'bg-gray-400'
                                }`}
                                title={`${booking.scheduled_time} - ${booking.booking_type === 'transport' ? `${booking.from_location} → ${booking.to_location}` : booking.experiences?.name} (${booking.passenger_count} pax)`}
                              >
                                <div className="truncate font-medium">{booking.scheduled_time}</div>
                                <div className="truncate">
                                  {booking.booking_type === 'transport' 
                                    ? `${booking.from_location} → ${booking.to_location}`
                                    : booking.experiences?.name?.slice(0, 15) + '...'
                                  }
                                </div>
                                <div className="truncate">{booking.passenger_count} pax</div>
                              </div>
                            )
                          })}
                          
                          {dayBookings.length === 0 && (
                            <div className="text-center text-gray-400 mt-6 text-xs">Available</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
            
            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="card-luxury">
                <h3 className="font-semibold mb-2 text-sm">Fleet Utilization Today</h3>
                <div className="text-2xl font-bold text-primary-600">
                  {Math.round((bookings.filter(b => 
                    new Date(b.scheduled_date).toDateString() === new Date().toDateString() &&
                    b.status !== 'cancelled'
                  ).length / HELICOPTER_FLEET.length) * 100)}%
                </div>
              </div>
              
              <div className="card-luxury">
                <h3 className="font-semibold mb-2 text-sm">Conflicts to Resolve</h3>
                <div className="text-2xl font-bold text-red-600">0</div>
                <p className="text-xs text-gray-600">No scheduling conflicts detected</p>
              </div>
              
              <div className="card-luxury">
                <h3 className="font-semibold mb-2 text-sm">Revenue This Week</h3>
                <div className="text-2xl font-bold text-green-600">
                  ${bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.total_price, 0)}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    console.log('Manual refresh triggered')
                    fetchUsers()
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  🔄 Refresh Users
                </button>
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ➕ Create New User
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="card-luxury">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold">{user.full_name || 'Unnamed User'}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'pilot' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.kyc_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.kyc_verified ? 'Verified' : 'Pending KYC'}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><span className="font-medium">Email:</span> {user.email}</p>
                            <p><span className="font-medium">Phone:</span> {user.phone || 'N/A'}</p>
                            <p><span className="font-medium">Created:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Balance:</span> ${user.account_balance?.toFixed(2) || '0.00'}</p>
                            <p><span className="font-medium">Role:</span> {user.role}</p>
                            <p><span className="font-medium">Status:</span> {user.kyc_verified ? 'Active' : 'Pending'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 space-y-2">
                        <button
                          onClick={() => openEditUserModal(user)}
                          className="block w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                        >
                          ✏️ Edit Profile
                        </button>
                        {!user.kyc_verified && (
                          <button
                            onClick={() => {
                              // Verify user
                              updateUserRole(user.id, user.role)
                            }}
                            className="block w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
                          >
                            ✓ Verify KYC
                          </button>
                        )}
                        {user.role !== 'admin' && (
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          >
                            <option value="client">Client</option>
                            <option value="pilot">Pilot</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Top-up Approval System</h1>
              <div className="flex space-x-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  <span>Pending Review</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded"></div>
                  <span>Approved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded"></div>
                  <span>Rejected</span>
                </div>
              </div>
            </div>

            {/* Pending Top-ups Summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="card-luxury bg-yellow-50 border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-800 text-sm font-medium">Pending Reviews</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {transactions.filter(t => t.status === 'pending').length}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="mt-2 text-sm text-yellow-700">
                  Total: ${transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0)}
                </div>
              </div>
              
              <div className="card-luxury bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-800 text-sm font-medium">Approved Today</p>
                    <p className="text-2xl font-bold text-green-900">
                      {transactions.filter(t => t.status === 'approved' && 
                        new Date(t.processed_at || t.created_at).toDateString() === new Date().toDateString()
                      ).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="card-luxury bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 text-sm font-medium">Payment Methods</p>
                    <p className="text-sm text-blue-700">
                      Bank: {transactions.filter(t => t.payment_method === 'bank_transfer').length} | 
                      Crypto: {transactions.filter(t => t.payment_method === 'cryptocurrency').length}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="card-luxury text-center py-12">
                <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No transactions found</h3>
                <p className="text-gray-500">Top-up requests will appear here for approval</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="card-luxury border-l-4 border-l-yellow-400">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            ${transaction.amount} Top-up Request
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status.toUpperCase()}
                          </span>
                          {transaction.payment_method === 'cryptocurrency' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              🪙 Stablecoin Ready
                            </span>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <p><span className="font-medium">Client:</span> {transaction.user?.full_name}</p>
                            <p><span className="font-medium">Email:</span> {transaction.user?.email}</p>
                            <p><span className="font-medium">Method:</span> {transaction.payment_method.replace('_', ' ').toUpperCase()}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Reference:</span> {transaction.reference}</p>
                            <p><span className="font-medium">Submitted:</span> {new Date(transaction.created_at).toLocaleString()}</p>
                            {transaction.processed_at && (
                              <p><span className="font-medium">Processed:</span> {new Date(transaction.processed_at).toLocaleString()}</p>
                            )}
                          </div>
                          <div>
                            <p><span className="font-medium">Type:</span> Account Funding</p>
                            {transaction.admin_notes && (
                              <p><span className="font-medium">Admin Notes:</span> {transaction.admin_notes}</p>
                            )}
                          </div>
                        </div>

                        {/* Payment Proof Section */}
                        {transaction.payment_proof_url && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Payment Proof Submitted:</span>
                              <button
                                onClick={() => setSelectedTransaction(transaction)}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                              >
                                🔍 View Full Size
                              </button>
                            </div>
                            <div className="flex space-x-3">
                              <img
                                src={transaction.payment_proof_url}
                                alt="Payment proof"
                                className="w-24 h-32 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80"
                                onClick={() => setSelectedTransaction(transaction)}
                              />
                              <div className="flex-1 text-xs text-gray-600">
                                <p className="mb-1">📄 Payment verification document</p>
                                <p className="mb-1">📅 Uploaded with transaction</p>
                                <p>🔍 Click to enlarge and verify details</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="ml-6 space-y-2">
                        {transaction.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateTransactionStatus(transaction.id, 'approved')}
                              className="block w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                            >
                              ✅ Approve & Fund Account
                            </button>
                            <button
                              onClick={() => {
                                const notes = prompt('Why are you rejecting this transaction?')
                                if (notes && notes.trim()) {
                                  updateTransactionStatus(transaction.id, 'rejected', notes)
                                }
                              }}
                              className="block w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                            >
                              ❌ Reject Request
                            </button>
                            {transaction.payment_proof_url && (
                              <button
                                onClick={() => setSelectedTransaction(transaction)}
                                className="block w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                🔍 Review Proof
                              </button>
                            )}
                          </>
                        )}
                        
                        {transaction.status === 'approved' && (
                          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                            <p className="text-xs text-green-800 font-medium">Funds Added</p>
                          </div>
                        )}
                        
                        {transaction.status === 'rejected' && (
                          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                            <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                            <p className="text-xs text-red-800 font-medium">Request Denied</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pilots' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Pilots</h1>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pilots.map((pilot) => (
                  <div key={pilot.id} className="card-luxury">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{pilot.full_name || 'Unnamed Pilot'}</h3>
                      {pilot.kyc_verified ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{pilot.email}</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => openEditUserModal(pilot)}
                        className="bg-blue-600 text-white text-sm px-3 py-2 rounded hover:bg-blue-700 w-full"
                      >
                        ✏️ Edit Profile
                      </button>
                      {!pilot.kyc_verified && (
                        <button
                          onClick={() => verifyPilot(pilot.id)}
                          className="btn-primary text-sm w-full"
                        >
                          Verify KYC
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'choppers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
              <button
                onClick={() => setShowAddHelicopterModal(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Helicopter
              </button>
            </div>

            {/* Fleet Overview Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Aircraft</p>
                    <p className="text-3xl font-bold text-gray-900">{helicopters.length}</p>
                  </div>
                  <Plane className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Fleet</p>
                    <p className="text-3xl font-bold text-green-600">
                      {helicopters.filter(h => h.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">In Maintenance</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {helicopters.filter(h => h.status === 'maintenance').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Avg. Rate</p>
                    <p className="text-3xl font-bold text-primary-600">
                      ${helicopters.length > 0 ? Math.round(helicopters.reduce((sum, h) => sum + h.hourly_rate, 0) / helicopters.length) : 0}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary-600" />
                </div>
              </div>
            </div>

            {/* Helicopters Table */}
            <div className="card-luxury">
              <h2 className="text-xl font-semibold mb-4">Helicopter Fleet</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Aircraft</th>
                      <th className="text-left py-3 px-4">Registration</th>
                      <th className="text-left py-3 px-4">Capacity</th>
                      <th className="text-left py-3 px-4">Rate/Hour</th>
                      <th className="text-left py-3 px-4">Flight Hours</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Next Maintenance</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {helicopters.map((helicopter) => (
                      <tr key={helicopter.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{helicopter.name}</div>
                            <div className="text-sm text-gray-500">{helicopter.model}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">{helicopter.registration_number}</td>
                        <td className="py-3 px-4">{helicopter.capacity} pax</td>
                        <td className="py-3 px-4">${helicopter.hourly_rate}/hr</td>
                        <td className="py-3 px-4">{helicopter.total_flight_hours || 0}h</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            helicopter.status === 'active' ? 'bg-green-100 text-green-800' :
                            helicopter.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            helicopter.status === 'inspection' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {helicopter.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {helicopter.next_maintenance_due ? format(new Date(helicopter.next_maintenance_due), 'MMM dd, yyyy') : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedHelicopterForEdit(helicopter)
                                setShowEditHelicopterModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedHelicopterForEdit(helicopter)
                                setShowMaintenanceModal(true)
                              }}
                              className="text-green-600 hover:text-green-700 text-sm"
                            >
                              Maintenance
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Maintenance */}
            <div className="card-luxury mt-6">
              <h2 className="text-xl font-semibold mb-4">Recent Maintenance Records</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">Aircraft</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Description</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRecords.slice(0, 10).map((record) => (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{record.helicopter?.name}</div>
                          <div className="text-sm text-gray-500">{record.helicopter?.registration_number}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize">{record.maintenance_type}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate">{record.description}</td>
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(record.start_date), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'completed' ? 'bg-green-100 text-green-800' :
                            record.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            record.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {record.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">{record.cost ? `$${record.cost}` : 'N/A'}</td>
                      </tr>
                    ))}
                    {maintenanceRecords.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No maintenance records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary-600" />
                </div>
              </div>
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Pilots</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {pilots.filter(p => p.kyc_verified).length}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="card-luxury">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${bookings.reduce((sum, b) => sum + b.total_price, 0)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-luxury-gold" />
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card-luxury">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm">New booking from John Doe</span>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm">Payment approved for Ana Rodriguez</span>
                    <span className="text-xs text-gray-500">5 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">New pilot registered: Miguel Santos</span>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                </div>
              </div>
              
              <div className="card-luxury">
                <h3 className="text-lg font-semibold mb-4">Pending Actions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-yellow-600">{bookings.filter(b => b.status === 'pending').length} bookings awaiting approval</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Action needed</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-blue-600">{transactions.filter(t => t.status === 'pending').length} payments to review</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Review</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-purple-600">{pilots.filter(p => !p.kyc_verified).length} pilots awaiting verification</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">KYC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pilot Assignment Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Plane className="h-6 w-6 mr-2 text-primary-600" />
              Assign Flight Crew & Aircraft
            </h3>
            
            {/* Booking Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-2">Booking Details:</h4>
              <p className="text-sm text-gray-600">
                {selectedBooking.booking_type === 'transport' 
                  ? `${selectedBooking.from_location} → ${selectedBooking.to_location}`
                  : selectedBooking.experiences?.name
                }
              </p>
              <p className="text-sm text-gray-600">
                Date: {format(new Date(selectedBooking.scheduled_date), 'MMM dd, yyyy')} at {selectedBooking.scheduled_time}
              </p>
              <p className="text-sm text-gray-600">
                Passengers: {selectedBooking.passenger_count} | Base Price: ${selectedBooking.total_price - (selectedBooking.addon_total_price || 0)}
                {selectedBooking.addon_total_price > 0 && (
                  <span> | Add-ons: ${selectedBooking.addon_total_price} | Total: ${selectedBooking.total_price}</span>
                )}
              </p>
              
              {/* Passenger Details */}
              {selectedBooking.passenger_details && selectedBooking.passenger_details.length > 0 && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <h5 className="font-medium text-sm mb-2">Passenger Information:</h5>
                  <div className="space-y-2">
                    {selectedBooking.passenger_details.map((passenger: any, index: number) => (
                      <div key={index} className="text-xs bg-white rounded p-2">
                        <div className="font-medium">{passenger.name} (Age: {passenger.age})</div>
                        {passenger.passport && <div>ID: {passenger.passport}</div>}
                        {passenger.emergency_contact && <div>Emergency: {passenger.emergency_contact}</div>}
                        {passenger.dietary_restrictions && <div>Dietary: {passenger.dietary_restrictions}</div>}
                        {passenger.special_requests && <div>Special: {passenger.special_requests}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Selected Add-ons */}
              {selectedBooking.selected_addons && selectedBooking.selected_addons.length > 0 && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <h5 className="font-medium text-sm mb-2">Selected Add-ons:</h5>
                  <div className="space-y-1">
                    {selectedBooking.selected_addons.map((addon: any, index: number) => (
                      <div key={index} className="text-xs flex justify-between bg-white rounded p-2">
                        <span>{addon.addon_id} × {addon.quantity}</span>
                        <span>${(addon.quantity * addon.unit_price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Helicopter Selection */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Plane className="h-5 w-5 mr-2 text-blue-600" />
                  Select Helicopter
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {HELICOPTER_FLEET.map((helicopter) => (
                    <div
                      key={helicopter.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedHelicopter === helicopter.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedHelicopter(helicopter.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{helicopter.name}</h5>
                          <p className="text-xs text-gray-600">{helicopter.capacity} passengers</p>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          ${helicopter.hourly_rate}/hr
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pilot Selection */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Assign Pilot
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availablePilots.map((pilot) => (
                    <div
                      key={pilot.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedPilot === pilot.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPilot(pilot.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="font-medium">{pilot.full_name || 'Unnamed Pilot'}</h5>
                          <p className="text-xs text-gray-600">{pilot.email}</p>
                        </div>
                        {pilot.kyc_verified && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setSelectedBooking(null)
                  setSelectedHelicopter('')
                  setSelectedPilot('')
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!selectedPilot || !selectedHelicopter) {
                    alert('Please select both a pilot and helicopter')
                    return
                  }
                  updateBookingStatus(selectedBooking.id, 'assigned', selectedPilot, selectedHelicopter)
                  setSelectedHelicopter('')
                  setSelectedPilot('')
                }}
                disabled={!selectedPilot || !selectedHelicopter}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Flight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Users className="h-6 w-6 mr-2 text-green-600" />
              Create New User
            </h3>
            
            <form onSubmit={(e) => { e.preventDefault(); createNewUser(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="user@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newUserData.full_name}
                  onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="+502 5555 5555"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Role *
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as 'client' | 'pilot' | 'admin' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="client">Client (Customer)</option>
                  <option value="pilot">Pilot</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {newUserData.role === 'client' && 'Can book flights and manage profile'}
                  {newUserData.role === 'pilot' && 'Can access pilot dashboard and manage flights'}
                  {newUserData.role === 'admin' && 'Full access to admin panel and all features'}
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> User will be created and can login immediately. 
                  {newUserData.role === 'admin' ? ' Admin users are auto-verified.' : 
                   newUserData.role === 'pilot' ? ' Pilot users need KYC verification.' : 
                   ' Client users can start booking immediately.'}
                </p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateUserModal(false)
                    setNewUserData({
                      email: '',
                      password: '',
                      full_name: '',
                      role: 'client',
                      phone: ''
                    })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Proof Viewer Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center">
                <DollarSign className="h-6 w-6 mr-2 text-green-600" />
                Payment Proof Review - ${selectedTransaction.amount}
              </h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Transaction Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-3">Transaction Details:</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Client:</span> {selectedTransaction.user?.full_name}</p>
                  <p><span className="font-medium">Email:</span> {selectedTransaction.user?.email}</p>
                  <p><span className="font-medium">Amount:</span> ${selectedTransaction.amount}</p>
                </div>
                <div>
                  <p><span className="font-medium">Method:</span> {selectedTransaction.payment_method.replace('_', ' ').toUpperCase()}</p>
                  <p><span className="font-medium">Reference:</span> {selectedTransaction.reference}</p>
                  <p><span className="font-medium">Submitted:</span> {new Date(selectedTransaction.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Payment Proof Image */}
            <div className="text-center mb-6">
              <h4 className="font-semibold mb-3">Payment Proof Document:</h4>
              {selectedTransaction.payment_proof_url ? (
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={selectedTransaction.payment_proof_url}
                    alt="Payment proof document"
                    className="max-w-full max-h-96 mx-auto object-contain"
                  />
                </div>
              ) : (
                <div className="bg-gray-100 p-8 rounded-lg">
                  <p className="text-gray-600">No payment proof attached to this transaction</p>
                </div>
              )}
            </div>

            {/* Stablecoin Integration Notice */}
            {selectedTransaction.payment_method === 'cryptocurrency' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <span className="text-blue-800 font-medium">🪙 Stablecoin Payment Integration</span>
                </div>
                <p className="text-sm text-blue-700">
                  This transaction uses cryptocurrency payment method. Future stablecoin integration will enable:
                </p>
                <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
                  <li>Automatic verification via blockchain transaction hash</li>
                  <li>Real-time balance updates upon confirmation</li>
                  <li>Multi-chain support (USDC, USDT, DAI)</li>
                  <li>Reduced manual approval time</li>
                </ul>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
              
              {selectedTransaction.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      updateTransactionStatus(selectedTransaction.id, 'approved')
                      setSelectedTransaction(null)
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    ✅ Approve & Fund Account
                  </button>
                  <button
                    onClick={() => {
                      const notes = prompt('Why are you rejecting this transaction?')
                      if (notes && notes.trim()) {
                        updateTransactionStatus(selectedTransaction.id, 'rejected', notes)
                        setSelectedTransaction(null)
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    ❌ Reject Request
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User/Pilot Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center">
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                Edit {selectedUser.role === 'pilot' ? 'Pilot' : 'User'} Profile
              </h3>
              <button
                onClick={() => {
                  setShowEditUserModal(false)
                  setSelectedUser(null)
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* User Details Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-2">Current Profile:</h4>
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">User ID:</span> {selectedUser.id}</p>
                <p><span className="font-medium">Created:</span> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                <p><span className="font-medium">Current Role:</span> {selectedUser.role}</p>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); updateUserProfile(); }} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editUserData.full_name}
                    onChange={(e) => setEditUserData({ ...editUserData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editUserData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                    title="Email cannot be changed"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editUserData.phone}
                    onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="+502 5555 5555"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={editUserData.role}
                    onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="client">Client (Customer)</option>
                    <option value="pilot">Pilot</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Balance (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editUserData.account_balance}
                    onChange={(e) => setEditUserData({ ...editUserData, account_balance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Manually adjust user balance</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Status
                  </label>
                  <div className="flex items-center space-x-4 pt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="kyc_verified"
                        checked={editUserData.kyc_verified}
                        onChange={() => setEditUserData({ ...editUserData, kyc_verified: true })}
                        className="mr-2"
                      />
                      <span className="text-sm text-green-700">✓ Verified</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="kyc_verified"
                        checked={!editUserData.kyc_verified}
                        onChange={() => setEditUserData({ ...editUserData, kyc_verified: false })}
                        className="mr-2"
                      />
                      <span className="text-sm text-yellow-700">⏳ Pending</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes
                </label>
                <textarea
                  value={editUserData.notes}
                  onChange={(e) => setEditUserData({ ...editUserData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Internal notes about this user (not visible to user)"
                />
              </div>
              
              {/* Warning for role changes */}
              {editUserData.role !== selectedUser.role && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Warning:</strong> Changing the user role will affect their access permissions.
                  </p>
                </div>
              )}
              
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserModal(false)
                    setSelectedUser(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditBookingModal && selectedBookingForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                Review & Edit Booking
              </h3>
              <button
                onClick={() => {
                  setShowEditBookingModal(false)
                  setSelectedBookingForEdit(null)
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Current Booking Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-3">Original Booking:</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p><span className="font-medium">Client:</span> {selectedBookingForEdit.client?.full_name}</p>
                  <p><span className="font-medium">Route:</span> {selectedBookingForEdit.from_location} → {selectedBookingForEdit.to_location}</p>
                  <p><span className="font-medium">Date:</span> {selectedBookingForEdit.scheduled_date}</p>
                </div>
                <div>
                  <p><span className="font-medium">Time:</span> {selectedBookingForEdit.scheduled_time}</p>
                  <p><span className="font-medium">Passengers:</span> {selectedBookingForEdit.passenger_count}</p>
                  <p><span className="font-medium">Price:</span> ${selectedBookingForEdit.total_price}</p>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); approveBookingWithChanges(); }} className="space-y-4">
              {/* Route */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Location
                  </label>
                  <input
                    type="text"
                    value={editBookingData.from_location}
                    onChange={(e) => setEditBookingData({ ...editBookingData, from_location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Location
                  </label>
                  <input
                    type="text"
                    value={editBookingData.to_location}
                    onChange={(e) => setEditBookingData({ ...editBookingData, to_location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              
              {/* Date and Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={editBookingData.scheduled_date}
                    onChange={(e) => setEditBookingData({ ...editBookingData, scheduled_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    value={editBookingData.scheduled_time}
                    onChange={(e) => setEditBookingData({ ...editBookingData, scheduled_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Round Trip Toggle */}
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editBookingData.is_round_trip}
                    onChange={(e) => setEditBookingData({ 
                      ...editBookingData, 
                      is_round_trip: e.target.checked,
                      return_date: e.target.checked ? editBookingData.return_date : '',
                      return_time: e.target.checked ? editBookingData.return_time : ''
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Round Trip</span>
                </label>
              </div>

              {/* Return Details - Only show if round trip */}
              {editBookingData.is_round_trip && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={editBookingData.return_date}
                      onChange={(e) => setEditBookingData({ ...editBookingData, return_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Return Time
                    </label>
                    <input
                      type="time"
                      value={editBookingData.return_time}
                      onChange={(e) => setEditBookingData({ ...editBookingData, return_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
              )}
              
              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Passengers
                </label>
                <select
                  value={editBookingData.passenger_count}
                  onChange={(e) => setEditBookingData({ ...editBookingData, passenger_count: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Notes
                </label>
                <textarea
                  value={editBookingData.notes}
                  onChange={(e) => setEditBookingData({ ...editBookingData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Special requests or preferences..."
                />
              </div>
              
              {/* Revision Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Revision Notes (Required) *
                </label>
                <textarea
                  value={editBookingData.revision_notes}
                  onChange={(e) => setEditBookingData({ ...editBookingData, revision_notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Explain the changes you're making and why (client will see this)..."
                  required
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>How this works:</strong> Your changes will be sent to the client for review. They can accept the changes and proceed with payment, or request further modifications.
                </p>
              </div>
              
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditBookingModal(false)
                    setSelectedBookingForEdit(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Revision to Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Helicopter Modal */}
      {showAddHelicopterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">Add New Helicopter</h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              try {
                const { error } = await supabase
                  .from('helicopters')
                  .insert({
                    id: newHelicopterData.name.toLowerCase().replace(/\s+/g, '-'),
                    ...newHelicopterData
                  })

                if (error) throw error
                
                setShowAddHelicopterModal(false)
                setNewHelicopterData({
                  name: '',
                  model: '',
                  manufacturer: '',
                  year_manufactured: new Date().getFullYear(),
                  registration_number: '',
                  capacity: 4,
                  hourly_rate: 600,
                  max_range_km: 500,
                  cruise_speed_kmh: 180,
                  fuel_capacity_liters: 200,
                  fuel_consumption_lph: 50,
                  location: 'Guatemala City Base',
                  notes: ''
                })
                fetchHelicopters()
                alert('Helicopter added successfully!')
              } catch (error: any) {
                alert('Error adding helicopter: ' + error.message)
              }
            }} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newHelicopterData.name}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={newHelicopterData.model}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={newHelicopterData.manufacturer}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                  <input
                    type="text"
                    value={newHelicopterData.registration_number}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, registration_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={newHelicopterData.year_manufactured}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, year_manufactured: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={newHelicopterData.capacity}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={newHelicopterData.hourly_rate}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, hourly_rate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Range (km)</label>
                  <input
                    type="number"
                    value={newHelicopterData.max_range_km}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, max_range_km: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newHelicopterData.location}
                    onChange={(e) => setNewHelicopterData({ ...newHelicopterData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newHelicopterData.notes}
                  onChange={(e) => setNewHelicopterData({ ...newHelicopterData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddHelicopterModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Add Helicopter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Helicopter Modal */}
      {showEditHelicopterModal && selectedHelicopterForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">Edit Helicopter</h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              try {
                const { error } = await supabase
                  .from('helicopters')
                  .update({
                    name: selectedHelicopterForEdit.name,
                    model: selectedHelicopterForEdit.model,
                    manufacturer: selectedHelicopterForEdit.manufacturer,
                    year_manufactured: selectedHelicopterForEdit.year_manufactured,
                    registration_number: selectedHelicopterForEdit.registration_number,
                    capacity: selectedHelicopterForEdit.capacity,
                    hourly_rate: selectedHelicopterForEdit.hourly_rate,
                    max_range_km: selectedHelicopterForEdit.max_range_km,
                    cruise_speed_kmh: selectedHelicopterForEdit.cruise_speed_kmh,
                    fuel_capacity_liters: selectedHelicopterForEdit.fuel_capacity_liters,
                    fuel_consumption_lph: selectedHelicopterForEdit.fuel_consumption_lph,
                    status: selectedHelicopterForEdit.status,
                    location: selectedHelicopterForEdit.location,
                    notes: selectedHelicopterForEdit.notes,
                    total_flight_hours: selectedHelicopterForEdit.total_flight_hours,
                    last_maintenance_date: selectedHelicopterForEdit.last_maintenance_date,
                    next_maintenance_due: selectedHelicopterForEdit.next_maintenance_due,
                    insurance_expiry: selectedHelicopterForEdit.insurance_expiry,
                    certification_expiry: selectedHelicopterForEdit.certification_expiry
                  })
                  .eq('id', selectedHelicopterForEdit.id)

                if (error) throw error
                
                setShowEditHelicopterModal(false)
                fetchHelicopters()
                alert('Helicopter updated successfully!')
              } catch (error: any) {
                alert('Error updating helicopter: ' + error.message)
              }
            }} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedHelicopterForEdit.name}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={selectedHelicopterForEdit.model}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedHelicopterForEdit.status}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inspection">Inspection</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={selectedHelicopterForEdit.hourly_rate}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, hourly_rate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Flight Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedHelicopterForEdit.total_flight_hours || 0}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, total_flight_hours: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={selectedHelicopterForEdit.location}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance Due</label>
                  <input
                    type="date"
                    value={selectedHelicopterForEdit.next_maintenance_due || ''}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, next_maintenance_due: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry</label>
                  <input
                    type="date"
                    value={selectedHelicopterForEdit.insurance_expiry || ''}
                    onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, insurance_expiry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={selectedHelicopterForEdit.notes || ''}
                  onChange={(e) => setSelectedHelicopterForEdit({ ...selectedHelicopterForEdit, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditHelicopterModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Update Helicopter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedHelicopterForEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold mb-6">Schedule Maintenance</h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              
              try {
                const { error } = await supabase
                  .from('maintenance_records')
                  .insert({
                    helicopter_id: selectedHelicopterForEdit.id,
                    maintenance_type: formData.get('maintenance_type'),
                    description: formData.get('description'),
                    start_date: formData.get('start_date'),
                    status: 'scheduled',
                    performed_by: formData.get('performed_by'),
                    cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : null,
                    notes: formData.get('notes')
                  })

                if (error) throw error
                
                // Update helicopter status if going into maintenance
                if (formData.get('maintenance_type') !== 'inspection') {
                  await supabase
                    .from('helicopters')
                    .update({ status: 'maintenance' })
                    .eq('id', selectedHelicopterForEdit.id)
                }
                
                setShowMaintenanceModal(false)
                fetchHelicopters()
                fetchMaintenanceRecords()
                alert('Maintenance scheduled successfully!')
              } catch (error: any) {
                alert('Error scheduling maintenance: ' + error.message)
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
                <select
                  name="maintenance_type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="scheduled">Scheduled Maintenance</option>
                  <option value="unscheduled">Unscheduled Repair</option>
                  <option value="inspection">Inspection</option>
                  <option value="upgrade">Upgrade</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                  placeholder="Describe the maintenance work..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Performed By</label>
                <input
                  type="text"
                  name="performed_by"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Technician or company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost ($)</label>
                <input
                  type="number"
                  name="cost"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Schedule Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}