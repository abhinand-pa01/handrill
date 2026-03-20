import { createContext, useContext, useCallback } from 'react';
import { BOOKINGS, WORKERS, CUSTOMERS, SERVICES, REVIEWS } from '../data/mockData';
import { findBestWorker } from '../data/assignmentEngine';
import { useLocalStorage } from '../utils/useLocalStorage';

const AppContext = createContext(null);

const KEYS = {
  bookings:   'handrill_bookings',
  workers:    'handrill_workers',
  reviews:    'handrill_reviews',
  customers:  'handrill_local_customers',
};

const DATE_FIELDS = ['scheduledAt','assignedAt','startedAt','completedAt','createdAt','updatedAt'];

function rehydrateBookings(list) {
  return list.map(b => {
    const out = { ...b };
    DATE_FIELDS.forEach(f => { if (out[f]) out[f] = new Date(out[f]); });
    return out;
  });
}

function rehydrateReviews(list) {
  return list.map(r => ({ ...r, createdAt: r.createdAt ? new Date(r.createdAt) : null }));
}

/** String-normalise any id so numeric and string variants both compare equal */
const sid = v => String(v ?? '');

export function AppProvider({ children }) {
  const [bookings,       setBookings]       = useLocalStorage(KEYS.bookings,   BOOKINGS);
  const [workers,        setWorkers]        = useLocalStorage(KEYS.workers,    WORKERS);
  const [reviews,        setReviews]        = useLocalStorage(KEYS.reviews,    REVIEWS);
  const [localCustomers, setLocalCustomers] = useLocalStorage(KEYS.customers,  CUSTOMERS);

  const hydratedBookings = rehydrateBookings(bookings);
  const hydratedReviews  = rehydrateReviews(reviews);

  // Merged customer list: static + dynamically registered
  const allCustomers = [
    ...CUSTOMERS,
    ...localCustomers.filter(lc => !CUSTOMERS.some(c => sid(c.id) === sid(lc.id))),
  ];

  // ── Selectors ─────────────────────────────────────────────────────────────
  const getWorkerById         = useCallback(id => workers.find(w => sid(w.id) === sid(id)), [workers]);
  const getCustomerById       = useCallback(id => allCustomers.find(c => sid(c.id) === sid(id)), [allCustomers]);
  const getServiceById        = useCallback(id => SERVICES.find(s => sid(s.id) === sid(id)), []);
  const getBookingsByCustomer = useCallback(cid => hydratedBookings.filter(b => sid(b.customerId) === sid(cid)), [hydratedBookings]);
  const getBookingsByWorker   = useCallback(wid => hydratedBookings.filter(b => sid(b.workerId) === sid(wid)), [hydratedBookings]);
  const getReviewForBooking   = useCallback(bid => hydratedReviews.find(r => sid(r.bookingId) === sid(bid)), [hydratedReviews]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const createBooking = useCallback((bookingData, currentUser) => {
    const service    = SERVICES.find(s => sid(s.id) === sid(bookingData.serviceId));
    const bestWorker = service ? findBestWorker(service, workers) : null;

    const newBooking = {
      id:             'b' + Date.now(),
      customerId:     sid(currentUser.id),
      serviceId:      sid(bookingData.serviceId),
      workerId:       bestWorker ? sid(bestWorker.id) : null,
      status:         bestWorker ? 'ASSIGNED' : 'PENDING',
      paymentStatus:  'PENDING',
      amount:         service?.price || 0,
      serviceAddress: bookingData.serviceAddress,
      notes:          bookingData.notes || '',
      reviewed:       false,
      scheduledAt:    bookingData.scheduledAt,
      assignedAt:     bestWorker ? new Date() : null,
      startedAt:      null,
      completedAt:    null,
      createdAt:      new Date(),
    };

    setBookings(prev => [newBooking, ...prev]);
    if (bestWorker) {
      setWorkers(prev => prev.map(w =>
        sid(w.id) === sid(bestWorker.id)
          ? { ...w, profile: { ...w.profile, activeJobCount: w.profile.activeJobCount + 1 } }
          : w
      ));
    }
    return newBooking;
  }, [workers, setBookings, setWorkers]);

  const updateBookingStatus = useCallback((bookingId, newStatus, workerId) => {
    setBookings(prev => prev.map(b => {
      if (sid(b.id) !== sid(bookingId)) return b;
      return {
        ...b,
        status:        newStatus,
        startedAt:     newStatus === 'INPROGRESS' ? new Date() : b.startedAt,
        completedAt:   newStatus === 'COMPLETED'  ? new Date() : b.completedAt,
        paymentStatus: newStatus === 'COMPLETED'  ? 'PAID'     : b.paymentStatus,
      };
    }));
    if (newStatus === 'COMPLETED' && workerId) {
      setWorkers(prev => prev.map(w =>
        sid(w.id) === sid(workerId)
          ? { ...w, profile: {
              ...w.profile,
              activeJobCount:     Math.max(0, w.profile.activeJobCount - 1),
              totalJobsCompleted: w.profile.totalJobsCompleted + 1,
            }}
          : w
      ));
    }
  }, [setBookings, setWorkers]);

  const cancelBooking = useCallback((bookingId) => {
    setBookings(prev => prev.map(b => {
      if (sid(b.id) !== sid(bookingId)) return b;
      if (b.workerId) {
        setWorkers(wPrev => wPrev.map(w =>
          sid(w.id) === sid(b.workerId)
            ? { ...w, profile: { ...w.profile, activeJobCount: Math.max(0, w.profile.activeJobCount - 1) } }
            : w
        ));
      }
      return {
        ...b,
        status:        'CANCELLED',
        paymentStatus: b.paymentStatus === 'PAID' ? 'REFUNDED' : 'CANCELLED',
      };
    }));
  }, [setBookings, setWorkers]);

  const toggleWorkerAvailability = useCallback((workerId) => {
    setWorkers(prev => prev.map(w =>
      sid(w.id) === sid(workerId)
        ? { ...w, profile: { ...w.profile, online: !w.profile.online } }
        : w
    ));
  }, [setWorkers]);

  const submitReview = useCallback((bookingId, customerId, workerId, rating, comment) => {
    const newReview = {
      id:         'r' + Date.now(),
      bookingId:  sid(bookingId),
      customerId: sid(customerId),
      workerId:   sid(workerId),
      rating,
      comment,
      createdAt:  new Date(),
    };
    setReviews(prev => [...prev, newReview]);
    setBookings(prev => prev.map(b => sid(b.id) === sid(bookingId) ? { ...b, reviewed: true } : b));
    setWorkers(prev => prev.map(w => {
      if (sid(w.id) !== sid(workerId)) return w;
      const allRevs = [...hydratedReviews, newReview].filter(r => sid(r.workerId) === sid(workerId));
      const avg = allRevs.reduce((s, r) => s + r.rating, 0) / allRevs.length;
      return { ...w, profile: { ...w.profile, averageRating: Math.round(avg * 10) / 10 } };
    }));
  }, [setReviews, setBookings, setWorkers, hydratedReviews]);

  const overrideAssignment = useCallback((bookingId, newWorkerId) => {
    setBookings(prev => prev.map(b => {
      if (sid(b.id) !== sid(bookingId)) return b;
      if (b.workerId) {
        setWorkers(p => p.map(w => sid(w.id) === sid(b.workerId)
          ? { ...w, profile: { ...w.profile, activeJobCount: Math.max(0, w.profile.activeJobCount - 1) } } : w));
      }
      if (newWorkerId) {
        setWorkers(p => p.map(w => sid(w.id) === sid(newWorkerId)
          ? { ...w, profile: { ...w.profile, activeJobCount: w.profile.activeJobCount + 1 } } : w));
      }
      return {
        ...b,
        workerId:   newWorkerId ? sid(newWorkerId) : null,
        status:     newWorkerId ? 'ASSIGNED' : 'PENDING',
        assignedAt: newWorkerId ? new Date() : null,
      };
    }));
  }, [setBookings, setWorkers]);

  const addWorker = useCallback((workerData) => {
    const newWorker = {
      id:        'w' + Date.now(),
      name:      workerData.name,
      email:     workerData.email,
      phone:     workerData.phone     || '',
      role:      'WORKER',
      avatar:    null,
      _password: workerData.password  || 'demo123',
      profile: {
        online:             false,
        location:           workerData.location    || 'Thrissur',
        experience:         Number(workerData.experience) || 1,
        bio:                workerData.bio         || '',
        languages:          workerData.languages   || 'Malayalam',
        idProof:            Boolean(workerData.idProof),
        averageRating:      0,
        totalJobsCompleted: 0,
        activeJobCount:     0,
        performanceScore:   0,
        workStartTime:      workerData.workStartTime || '09:00',
        workEndTime:        workerData.workEndTime   || '18:00',
        specializations:    workerData.specializations || [],
      },
    };
    setWorkers(prev => [...prev, newWorker]);
    return newWorker;
  }, [setWorkers]);

  const updateWorker = useCallback((workerId, updates) => {
    setWorkers(prev => prev.map(w => {
      if (sid(w.id) !== sid(workerId)) return w;
      return {
        ...w,
        name:  updates.name  ?? w.name,
        email: updates.email ?? w.email,
        phone: updates.phone ?? w.phone,
        ...(updates.password ? { _password: updates.password } : {}),
        profile: {
          ...w.profile,
          location:        updates.location        ?? w.profile.location,
          experience:      updates.experience      != null ? Number(updates.experience) : w.profile.experience,
          bio:             updates.bio             ?? w.profile.bio,
          languages:       updates.languages       ?? w.profile.languages,
          idProof:         updates.idProof         != null ? Boolean(updates.idProof) : w.profile.idProof,
          workStartTime:   updates.workStartTime   ?? w.profile.workStartTime,
          workEndTime:     updates.workEndTime     ?? w.profile.workEndTime,
          specializations: updates.specializations ?? w.profile.specializations,
        },
      };
    }));
  }, [setWorkers]);

  const deleteWorker = useCallback((workerId) => {
    setWorkers(prev => prev.filter(w => sid(w.id) !== sid(workerId)));
  }, [setWorkers]);

  const resetAppData = useCallback(() => {
    setBookings(BOOKINGS);
    setWorkers(WORKERS);
    setReviews(REVIEWS);
    setLocalCustomers(CUSTOMERS);
  }, [setBookings, setWorkers, setReviews, setLocalCustomers]);

  return (
    <AppContext.Provider value={{
      bookings:   hydratedBookings,
      workers,
      customers:  allCustomers,
      services:   SERVICES,
      reviews:    hydratedReviews,
      createBooking,
      updateBookingStatus,
      cancelBooking,
      toggleWorkerAvailability,
      submitReview,
      overrideAssignment,
      addWorker,
      updateWorker,
      deleteWorker,
      resetAppData,
      getWorkerById,
      getCustomerById,
      getServiceById,
      getBookingsByCustomer,
      getBookingsByWorker,
      getReviewForBooking,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
