/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Participant, EventConfig, UserRole, StaffUser } from './types';
import { INITIAL_EVENT_CONFIG, INITIAL_PARTICIPANTS, MOCK_SCHEDULE } from './mockData';
import { isAllowedAdminEmail } from './utils/security';
import {
  auth,
  seedInitialDataIfNeeded,
  subscribeEventConfig,
  subscribeStaffUsers,
  subscribeParticipants,
  addParticipantInFirestore,
  addStaffUserInFirestore,
  deleteStaffUserInFirestore,
  deleteParticipantInFirestore,
  updateParticipantInFirestore,
  updateEventConfig,
  getParticipantsCountSecure,
  getSecretBatchCountSecure,
  subscribeSecretBatchCount,
  getExtraBatchCountSecure,
  subscribeExtraBatchCount,
  checkDuplicateParticipantSecure,
  loginStaffSecure,
  loginParticipantSecure
} from './firebase';

// Component Imports
import Splash from './components/Splash';
import LandingPage from './components/LandingPage';
import Cadastro from './components/Cadastro';
import Login from './components/Login';
import ParticipantArea from './components/ParticipantArea';
import ReceptionArea from './components/ReceptionArea';
import OrganizerArea from './components/OrganizerArea';
import AdminLock from './components/AdminLock';

export default function App() {
  // Check if the current URL points to the admin panel
  const checkIsAdminRoute = (): boolean => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path.endsWith('/admin') || 
      path.endsWith('/admin/') || 
      hash === '#/admin' || 
      hash === '#admin' ||
      hash.includes('admin')
    );
  };

  // Check if the current URL points to the secret registration batch (/secret)
  const checkIsSecretRoute = (): boolean => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path === '/secret' ||
      path === '/secret/' ||
      path.endsWith('/secret') ||
      path.endsWith('/secret/') ||
      hash === '#/secret' ||
      hash === '#secret' ||
      hash.includes('secret')
    );
  };

  // Check if current URL points to one of the 2 individual extra batch links (/vaga1 or /vaga2)
  const checkExtraBatchRoute = (): 'extra-1' | 'extra-2' | null => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    
    // Check Link 1 (Vaga Oculta 1)
    if (
      // Query parameters (100% immune to GitHub Pages 404)
      search.includes('vaga=1') || search.includes('vaga1') || 
      search.includes('vagaoculta=1') || search.includes('vagaoculta1') ||
      search.includes('lote=1') || search.includes('loteadicional=1') || search.includes('loteadicional1') ||
      search.includes('extra=1') || search.includes('extra1') ||
      // Hash routes (100% immune to GitHub Pages 404)
      hash === '#/vaga1' || hash === '#vaga1' || hash === '#/vaga-1' || hash === '#vaga-1' ||
      hash === '#/vagaoculta1' || hash === '#vagaoculta1' || hash === '#/vaga-oculta-1' || hash === '#vaga-oculta-1' ||
      hash === '#/loteadicional1' || hash === '#loteadicional1' || hash === '#/lote-adicional-1' || hash === '#lote-adicional-1' ||
      hash === '#/extra-1' || hash === '#extra-1' || hash === '#/extra1' || hash === '#extra1' ||
      hash === '#/adicional-1' || hash === '#adicional-1' ||
      hash.includes('vaga1') || hash.includes('vaga-1') || hash.includes('vagaoculta1') ||
      hash.includes('loteadicional1') || hash.includes('loteadicional-1') || hash.includes('lote-adicional-1') ||
      hash.includes('extra-1') || hash.includes('extra1') || hash.includes('adicional-1') ||
      // Path routes
      path === '/vaga1' || path === '/vaga1/' || path.endsWith('/vaga1') || path.endsWith('/vaga1/') ||
      path === '/vaga-1' || path === '/vaga-1/' || path.endsWith('/vaga-1') || path.endsWith('/vaga-1/') ||
      path === '/vagaoculta1' || path === '/vagaoculta1/' || path.endsWith('/vagaoculta1') || path.endsWith('/vagaoculta1/') ||
      path === '/vaga-oculta-1' || path === '/vaga-oculta-1/' || path.endsWith('/vaga-oculta-1') || path.endsWith('/vaga-oculta-1/') ||
      path === '/loteadicional1' || path === '/loteadicional1/' || path.endsWith('/loteadicional1') || path.endsWith('/loteadicional1/') ||
      path === '/lote-adicional-1' || path === '/lote-adicional-1/' || path.endsWith('/lote-adicional-1') || path.endsWith('/lote-adicional-1/') ||
      path === '/loteadicional-1' || path === '/loteadicional-1/' || path.endsWith('/loteadicional-1') || path.endsWith('/loteadicional-1/') ||
      path === '/extra-1' || path === '/extra-1/' || path.endsWith('/extra-1') || path.endsWith('/extra-1/') ||
      path === '/extra1' || path === '/extra1/' || path.endsWith('/extra1') || path.endsWith('/extra1/') ||
      path === '/adicional-1' || path === '/adicional-1/' || path.endsWith('/adicional-1') || path.endsWith('/adicional-1/')
    ) {
      return 'extra-1';
    }

    // Check Link 2 (Vaga Oculta 2)
    if (
      // Query parameters (100% immune to GitHub Pages 404)
      search.includes('vaga=2') || search.includes('vaga2') || 
      search.includes('vagaoculta=2') || search.includes('vagaoculta2') ||
      search.includes('lote=2') || search.includes('loteadicional=2') || search.includes('loteadicional2') ||
      search.includes('extra=2') || search.includes('extra2') ||
      // Hash routes (100% immune to GitHub Pages 404)
      hash === '#/vaga2' || hash === '#vaga2' || hash === '#/vaga-2' || hash === '#vaga-2' ||
      hash === '#/vagaoculta2' || hash === '#vagaoculta2' || hash === '#/vaga-oculta-2' || hash === '#vaga-oculta-2' ||
      hash === '#/loteadicional2' || hash === '#loteadicional2' || hash === '#/lote-adicional-2' || hash === '#lote-adicional-2' ||
      hash === '#/extra-2' || hash === '#extra-2' || hash === '#/extra2' || hash === '#extra2' ||
      hash === '#/adicional-2' || hash === '#adicional-2' ||
      hash.includes('vaga2') || hash.includes('vaga-2') || hash.includes('vagaoculta2') ||
      hash.includes('loteadicional2') || hash.includes('loteadicional-2') || hash.includes('lote-adicional-2') ||
      hash.includes('extra-2') || hash.includes('extra2') || hash.includes('adicional-2') ||
      // Path routes
      path === '/vaga2' || path === '/vaga2/' || path.endsWith('/vaga2') || path.endsWith('/vaga2/') ||
      path === '/vaga-2' || path === '/vaga-2/' || path.endsWith('/vaga-2') || path.endsWith('/vaga-2/') ||
      path === '/vagaoculta2' || path === '/vagaoculta2/' || path.endsWith('/vagaoculta2') || path.endsWith('/vagaoculta2/') ||
      path === '/vaga-oculta-2' || path === '/vaga-oculta-2/' || path.endsWith('/vaga-oculta-2') || path.endsWith('/vaga-oculta-2/') ||
      path === '/loteadicional2' || path === '/loteadicional2/' || path.endsWith('/loteadicional2') || path.endsWith('/loteadicional2/') ||
      path === '/lote-adicional-2' || path === '/lote-adicional-2/' || path.endsWith('/lote-adicional-2') || path.endsWith('/lote-adicional-2/') ||
      path === '/loteadicional-2' || path === '/loteadicional-2/' || path.endsWith('/loteadicional-2') || path.endsWith('/loteadicional-2/') ||
      path === '/extra-2' || path === '/extra-2/' || path.endsWith('/extra-2') || path.endsWith('/extra-2/') ||
      path === '/extra2' || path === '/extra2/' || path.endsWith('/extra2') || path.endsWith('/extra2/') ||
      path === '/adicional-2' || path === '/adicional-2/' || path.endsWith('/adicional-2') || path.endsWith('/adicional-2/')
    ) {
      return 'extra-2';
    }

    return null;
  };

  // Application states
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [eventConfig, setEventConfig] = useState<EventConfig>(INITIAL_EVENT_CONFIG);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [secureCount, setSecureCount] = useState<number>(0);
  const [secretCount, setSecretCount] = useState<number>(0);
  const [extra1Count, setExtra1Count] = useState<number>(0);
  const [extra2Count, setExtra2Count] = useState<number>(0);
  
  // Navigation states - initialized dynamically based on the current URL route
  const [splashCompleted, setSplashCompleted] = useState<boolean>(() => (
    checkIsAdminRoute() || checkIsSecretRoute() || checkExtraBatchRoute() !== null
  ));
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    if (checkIsAdminRoute()) {
      const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
      return isAuth ? 'organizer' : 'public';
    }
    return 'public';
  });
  const [currentView, setCurrentView] = useState<string>(() => {
    if (checkIsAdminRoute()) {
      const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
      return isAuth ? 'dashboard' : 'admin-lock';
    }
    if (checkIsSecretRoute()) {
      return 'cadastro-secret';
    }
    const extraRoute = checkExtraBatchRoute();
    if (extraRoute === 'extra-1') {
      return 'cadastro-extra-1';
    }
    if (extraRoute === 'extra-2') {
      return 'cadastro-extra-2';
    }
    return 'splash';
  });
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);

  // Fetch count securely on mount and update whenever participants are added
  const fetchParticipantsCount = async () => {
    try {
      const count = await getParticipantsCountSecure();
      setSecureCount(count);
    } catch (err) {
      console.error('Error fetching participant count securely:', err);
    }
  };

  // Fetch secret batch count securely
  const fetchSecretCount = async () => {
    try {
      const count = await getSecretBatchCountSecure();
      setSecretCount(count);
    } catch (err) {
      console.error('Error fetching secret count securely:', err);
    }
  };

  // Fetch extra batch counts securely
  const fetchExtraCounts = async () => {
    try {
      const [c1, c2] = await Promise.all([
        getExtraBatchCountSecure('extra-1'),
        getExtraBatchCountSecure('extra-2')
      ]);
      setExtra1Count(c1);
      setExtra2Count(c2);
    } catch (err) {
      console.error('Error fetching extra batch counts:', err);
    }
  };

  useEffect(() => {
    fetchParticipantsCount();
    fetchSecretCount();
    fetchExtraCounts();

    // Setup listener for secret batch registrations
    const unsubSecret = subscribeSecretBatchCount((count) => {
      setSecretCount(count);
    });

    // Setup listeners for extra batch registrations
    const unsubExtra1 = subscribeExtraBatchCount('extra-1', (count) => {
      setExtra1Count(count);
    });
    const unsubExtra2 = subscribeExtraBatchCount('extra-2', (count) => {
      setExtra2Count(count);
    });

    return () => {
      unsubSecret();
      unsubExtra1();
      unsubExtra2();
    };
  }, []);

  // Continuous Auth Guard: Ensure only authorized emails can retain organizer role
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const email = user.email?.toLowerCase().trim();
        if (!isAllowedAdminEmail(email)) {
          // If a logged-in user is not in the whitelist of 2 emails, remove admin session
          sessionStorage.removeItem('admin_authenticated');
          sessionStorage.removeItem('admin_token');
          sessionStorage.removeItem('admin_email');
          if (currentRole === 'organizer') {
            setCurrentRole('public');
            setCurrentView('admin-lock');
          }
        }
      }
    });

    return () => unsubAuth();
  }, [currentRole]);

  // Initialize and subscribe to Firestore collections securely based on the user role
  useEffect(() => {
    // Seed default configuration and default staff user on first run
    seedInitialDataIfNeeded();

    // Setup real-time listener for the event config (public info)
    const unsubConfig = subscribeEventConfig((config) => {
      setEventConfig(config);
    });

    let unsubStaff = () => {};
    let unsubParticipants = () => {};

    // Secure, role-based real-time subscriptions:
    // Unauthorized public users will NEVER trigger a subscription to sensitive collections.
    if (currentRole === 'organizer') {
      unsubStaff = subscribeStaffUsers((staffList) => {
        setStaffUsers(staffList);
      });
      unsubParticipants = subscribeParticipants((partList) => {
        setParticipants(partList);
      });
    } else if (currentRole === 'reception') {
      unsubParticipants = subscribeParticipants((partList) => {
        setParticipants(partList);
      });
    }

    return () => {
      unsubConfig();
      unsubStaff();
      unsubParticipants();
    };
  }, [currentRole]);

  // Hash/Path routing listener for admin and secret batch
  useEffect(() => {
    const handleRouteUpdate = () => {
      const extraRoute = checkExtraBatchRoute();
      if (checkIsAdminRoute()) {
        const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
        if (isAuth) {
          setCurrentRole('organizer');
          setCurrentView('dashboard');
        } else {
          setSplashCompleted(true); // Bypass splash for admin direct visits
          setCurrentRole('public');
          setCurrentView('admin-lock');
        }
      } else if (checkIsSecretRoute()) {
        setSplashCompleted(true);
        setCurrentRole('public');
        setCurrentView('cadastro-secret');
      } else if (extraRoute === 'extra-1') {
        setSplashCompleted(true);
        setCurrentRole('public');
        setCurrentView('cadastro-extra-1');
      } else if (extraRoute === 'extra-2') {
        setSplashCompleted(true);
        setCurrentRole('public');
        setCurrentView('cadastro-extra-2');
      } else {
        // If they navigate away from admin manually, go to landing
        if (currentView === 'admin-lock') {
          setCurrentRole('public');
          setCurrentView('landing');
        }
      }
    };

    handleRouteUpdate();
    window.addEventListener('hashchange', handleRouteUpdate);
    window.addEventListener('popstate', handleRouteUpdate);
    return () => {
      window.removeEventListener('hashchange', handleRouteUpdate);
      window.removeEventListener('popstate', handleRouteUpdate);
    };
  }, [currentView]);

  // Helper action: Register new staff user
  const handleAddStaffUser = async (newStaff: Omit<StaffUser, 'id' | 'createdAt'>) => {
    const freshStaff: StaffUser = {
      ...newStaff,
      id: `staff-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    await addStaffUserInFirestore(freshStaff);
  };

  // Helper action: Delete a staff user
  const handleDeleteStaffUser = async (id: string) => {
    await deleteStaffUserInFirestore(id);
  };

  // Helper action: Register new participant
  const handleAddParticipant = async (
    newPart: Omit<Participant, 'id' | 'status' | 'registrationDate'>,
    isSecretBatch: boolean = false,
    extraBatch?: 'extra-1' | 'extra-2'
  ) => {
    if (extraBatch) {
      // Check 1 registration limit for this specific extra batch link
      const currentExtraCount = await getExtraBatchCountSecure(extraBatch);
      if (currentExtraCount >= 1) {
        throw new Error('EXTRA_BATCH_FULL');
      }
    } else if (isSecretBatch) {
      // Check secret batch limit: maximum 11 people
      const currentSecretCount = await getSecretBatchCountSecure();
      const peopleToAdd = 1 + (Array.isArray(newPart.dependents) ? newPart.dependents.length : 0);
      if (currentSecretCount >= 11 || currentSecretCount + peopleToAdd > 11) {
        throw new Error('SECRET_BATCH_FULL');
      }
    } else {
      // Public regular registration is closed
      throw new Error('CAPACITY_REACHED');
    }

    // Check duplicates securely on the database to preserve LGPD privacy
    const { emailExists } = await checkDuplicateParticipantSecure(newPart.email, newPart.phone);
    if (emailExists) {
      throw new Error('EMAIL_EXISTS');
    }

    const freshParticipant: Participant = {
      ...newPart,
      id: `part-${Date.now()}`,
      status: 'Pendente',
      registrationDate: new Date().toLocaleDateString('pt-BR'),
      isSecretBatch: isSecretBatch ? true : false,
      ...(extraBatch ? { extraBatch } : {}),
    };
    await addParticipantInFirestore(freshParticipant);
    
    // Refresh public registration count securely
    await fetchParticipantsCount();
    await fetchSecretCount();
    await fetchExtraCounts();
  };

  // Helper action: Delete/Cancel participant registration
  const handleDeleteParticipant = async (participantId: string) => {
    await deleteParticipantInFirestore(participantId);
    await fetchParticipantsCount();
    await fetchSecretCount();
    await fetchExtraCounts();
    if (currentUser && currentUser.id === participantId) {
      setCurrentUser(null);
      setCurrentRole('public');
      setCurrentView('landing');
    }
  };

  // Helper action: Check in / Credenciar or Descredenciar participant (Toggle)
  const handleCheckIn = async (id: string) => {
    const target = participants.find((p) => p.id === id);
    const isCurrentlyPresent = target?.status === 'Presente';

    if (isCurrentlyPresent) {
      // Reverter credenciamento (Descredenciar) -> volta para Pendente
      await updateParticipantInFirestore(id, {
        status: 'Pendente',
        checkInTime: ''
      });

      if (currentUser && currentUser.id === id) {
        setCurrentUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'Pendente',
            checkInTime: undefined
          };
        });
      }
    } else {
      // Confirmar presença (Credenciar)
      const now = new Date();
      const timeString = `${now.getDate()}/07 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      await updateParticipantInFirestore(id, {
        status: 'Presente',
        checkInTime: timeString
      });

      // If current logged-in participant is the one checked in, update current user too!
      if (currentUser && currentUser.id === id) {
        setCurrentUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: 'Presente',
            checkInTime: timeString
          };
        });
      }
    }
  };

  const updateConfigState = async (newConfig: EventConfig) => {
    await updateEventConfig(newConfig);
  };

  // Reset all data to factory settings (kept for reset hooks compatibility if needed)
  const handleResetDemo = () => {
    setCurrentRole('public');
    setCurrentView('landing');
    setCurrentUser(null);
    setSplashCompleted(true);
  };

  // Safe router/navigation controller
  const handleNavigate = (view: string, role?: UserRole) => {
    if (role) {
      setCurrentRole(role);
    }

    // Special handlers
    if (view === 'splash') {
      setSplashCompleted(false);
      setCurrentRole('public');
      setCurrentView('splash');
      if (window.location.hash.includes('admin')) {
        window.location.hash = '';
      }
      return;
    }

    if (view === 'admin-lock') {
      window.location.hash = '#/admin';
      setSplashCompleted(true);
      setCurrentRole('public');
      setCurrentView('admin-lock');
      return;
    }

    if (view === 'landing' || view === 'home') {
      if (window.location.hash.includes('admin') || window.location.hash.includes('secret')) {
        window.location.hash = '';
      }
      if (typeof window !== 'undefined' && window.location.pathname.includes('/secret')) {
        window.history.pushState(null, '', '/');
      }
    }

    if (view === 'cadastro-secret' || view === 'secret') {
      window.location.hash = '#/secret';
      setSplashCompleted(true);
      setCurrentRole('public');
      setCurrentView('cadastro-secret');
      return;
    }

    if (view === 'cadastro-extra-1' || view === 'extra-1') {
      window.location.hash = '#/extra-1';
      setSplashCompleted(true);
      setCurrentRole('public');
      setCurrentView('cadastro-extra-1');
      return;
    }

    if (view === 'cadastro-extra-2' || view === 'extra-2') {
      window.location.hash = '#/extra-2';
      setSplashCompleted(true);
      setCurrentRole('public');
      setCurrentView('cadastro-extra-2');
      return;
    }

    if (view === 'login-reception') {
      setCurrentRole('public');
      setCurrentView('login-reception');
      return;
    }

    setCurrentView(view);
  };

  const handleLoginSuccess = (user: Participant) => {
    setCurrentUser(user);
    setCurrentRole('participant');
    setCurrentView('home');
  };

  const handleStaffLoginSuccess = () => {
    setCurrentRole('reception');
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole('public');
    setCurrentView('landing');
  };

  // Splash controller override
  const handleSplashComplete = () => {
    setSplashCompleted(true);
    setCurrentRole('public');
    setCurrentView('landing');
  };

  const handleUpdateCurrentUser = async (updatedUser: Participant) => {
    setCurrentUser(updatedUser);
    await updateParticipantInFirestore(updatedUser.id, updatedUser);
    await fetchParticipantsCount();
  };

  // Render the current view based on active role and view states
  const renderActiveView = () => {
    if (!splashCompleted && currentView === 'splash') {
      return <Splash onComplete={handleSplashComplete} />;
    }

    switch (currentRole) {
      case 'public':
        if (currentView === 'landing') {
          return (
            <LandingPage
              eventConfig={eventConfig}
              onNavigate={handleNavigate}
              participantsCount={secureCount}
            />
          );
        }
        if (currentView === 'cadastro-secret') {
          return (
            <Cadastro
              initialType="Público"
              onAddParticipant={handleAddParticipant}
              onNavigate={handleNavigate}
              participantsCount={secureCount}
              maxParticipants={eventConfig.maxParticipants}
              participants={[]}
              isSecretMode={true}
              secretBatchCount={secretCount}
            />
          );
        }
        if (currentView === 'cadastro-extra-1') {
          return (
            <Cadastro
              initialType="Público"
              onAddParticipant={handleAddParticipant}
              onNavigate={handleNavigate}
              participantsCount={secureCount}
              maxParticipants={eventConfig.maxParticipants}
              participants={[]}
              isSecretMode={false}
              extraBatchId="extra-1"
              extraBatchCount={extra1Count}
            />
          );
        }
        if (currentView === 'cadastro-extra-2') {
          return (
            <Cadastro
              initialType="Público"
              onAddParticipant={handleAddParticipant}
              onNavigate={handleNavigate}
              participantsCount={secureCount}
              maxParticipants={eventConfig.maxParticipants}
              participants={[]}
              isSecretMode={false}
              extraBatchId="extra-2"
              extraBatchCount={extra2Count}
            />
          );
        }
        if (currentView === 'cadastro' || currentView === 'cadastro-quarteto') {
          return (
            <Cadastro
              initialType={currentView === 'cadastro-quarteto' ? 'Participante' : 'Público'}
              onAddParticipant={handleAddParticipant}
              onNavigate={handleNavigate}
              participantsCount={secureCount}
              maxParticipants={eventConfig.maxParticipants}
              participants={[]}
              isSecretMode={false}
              secretBatchCount={secretCount}
            />
          );
        }
        if (currentView === 'login') {
          return (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onStaffLoginSuccess={handleStaffLoginSuccess}
              onNavigate={handleNavigate}
              initialMode="participant"
              onLoginParticipant={loginParticipantSecure}
              onLoginStaff={async (u, p) => {
                const staff = await loginStaffSecure(u, p);
                return !!staff;
              }}
            />
          );
        }
        if (currentView === 'login-reception') {
          return (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onStaffLoginSuccess={handleStaffLoginSuccess}
              onNavigate={handleNavigate}
              initialMode="reception"
              onLoginParticipant={loginParticipantSecure}
              onLoginStaff={async (u, p) => {
                const staff = await loginStaffSecure(u, p);
                return !!staff;
              }}
            />
          );
        }
        if (currentView === 'admin-lock') {
          return (
            <AdminLock
              onUnlockSuccess={() => {
                setCurrentRole('organizer');
                setCurrentView('dashboard');
              }}
              onCancel={() => {
                if (window.location.hash.includes('admin')) {
                  window.location.hash = '';
                }
                setCurrentRole('public');
                setCurrentView('landing');
              }}
            />
          );
        }
        return (
          <LandingPage
            eventConfig={eventConfig}
            onNavigate={handleNavigate}
            participantsCount={participants.length}
          />
        );

      case 'participant':
        if (currentUser) {
          return (
            <ParticipantArea
              currentUser={currentUser}
              schedule={MOCK_SCHEDULE}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
              onUpdateUser={handleUpdateCurrentUser}
              onDeleteUser={handleDeleteParticipant}
            />
          );
        }
        // Fallback to login if no active user session
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onStaffLoginSuccess={handleStaffLoginSuccess}
            onNavigate={handleNavigate}
            initialMode="participant"
            onLoginParticipant={loginParticipantSecure}
            onLoginStaff={async (u, p) => {
              const staff = await loginStaffSecure(u, p);
              return !!staff;
            }}
          />
        );

      case 'reception':
        return (
          <ReceptionArea
            participants={participants}
            onCheckIn={handleCheckIn}
            onLogout={handleLogout}
          />
        );

      case 'organizer':
        return (
          <OrganizerArea
            participants={participants}
            staffUsers={staffUsers}
            onAddStaffUser={handleAddStaffUser}
            onDeleteStaffUser={handleDeleteStaffUser}
            onDeleteParticipant={handleDeleteParticipant}
            eventConfig={eventConfig}
            onUpdateConfig={updateConfigState}
            onCheckIn={handleCheckIn}
            onLogout={handleLogout}
          />
        );

      default:
        return (
          <LandingPage
            eventConfig={eventConfig}
            onNavigate={handleNavigate}
            participantsCount={participants.length}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans">
      
      {/* Primary Workspace View Area */}
      {renderActiveView()}
      
    </div>
  );
}
