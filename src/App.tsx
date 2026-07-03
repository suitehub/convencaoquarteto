/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Participant, EventConfig, UserRole, StaffUser } from './types';
import { INITIAL_EVENT_CONFIG, INITIAL_PARTICIPANTS, MOCK_SCHEDULE } from './mockData';
import {
  seedInitialDataIfNeeded,
  subscribeEventConfig,
  subscribeStaffUsers,
  subscribeParticipants,
  addParticipantInFirestore,
  addStaffUserInFirestore,
  updateParticipantInFirestore,
  updateEventConfig
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
  // Application states
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [eventConfig, setEventConfig] = useState<EventConfig>(INITIAL_EVENT_CONFIG);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [splashCompleted, setSplashCompleted] = useState(false);
  
  // Navigation states
  const [currentRole, setCurrentRole] = useState<UserRole>('public');
  const [currentView, setCurrentView] = useState<string>('splash');
  const [currentUser, setCurrentUser] = useState<Participant | null>(null);

  // Initialize and subscribe to Firestore collections
  useEffect(() => {
    // Seed default configuration and default staff user on first run
    seedInitialDataIfNeeded();

    // Setup real-time listeners
    const unsubConfig = subscribeEventConfig((config) => {
      setEventConfig(config);
    });

    const unsubStaff = subscribeStaffUsers((staffList) => {
      setStaffUsers(staffList);
    });

    const unsubParticipants = subscribeParticipants((partList) => {
      setParticipants(partList);
    });

    return () => {
      unsubConfig();
      unsubStaff();
      unsubParticipants();
    };
  }, []);

  // Hash/Path routing listener for admin
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      if (path.endsWith('/admin') || path.endsWith('/admin/') || hash === '#/admin' || hash === '#admin') {
        const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
        if (isAuth) {
          setCurrentRole('organizer');
          setCurrentView('dashboard');
        } else {
          setSplashCompleted(true); // Bypass splash for direct admin link
          setCurrentRole('public');
          setCurrentView('admin-lock');
        }
      }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    return () => window.removeEventListener('hashchange', checkRoute);
  }, []);

  // Helper action: Register new staff user
  const handleAddStaffUser = async (newStaff: Omit<StaffUser, 'id' | 'createdAt'>) => {
    const freshStaff: StaffUser = {
      ...newStaff,
      id: `staff-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    await addStaffUserInFirestore(freshStaff);
  };

  // Helper action: Register new participant
  const handleAddParticipant = async (newPart: Omit<Participant, 'id' | 'status' | 'registrationDate'>) => {
    const freshParticipant: Participant = {
      ...newPart,
      id: `part-${Date.now()}`,
      status: 'Pendente',
      registrationDate: new Date().toLocaleDateString('pt-BR')
    };
    await addParticipantInFirestore(freshParticipant);
  };

  // Helper action: Check in/Credenciar participant
  const handleCheckIn = async (id: string) => {
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
            />
          );
        }
        if (currentView === 'cadastro' || currentView === 'cadastro-quarteto') {
          return (
            <Cadastro
              initialType={currentView === 'cadastro-quarteto' ? 'Participante' : 'Público'}
              onAddParticipant={handleAddParticipant}
              onNavigate={handleNavigate}
              participantsCount={participants.length}
              participants={participants}
            />
          );
        }
        if (currentView === 'login') {
          return (
            <Login
              participants={participants}
              staffUsers={staffUsers}
              onLoginSuccess={handleLoginSuccess}
              onStaffLoginSuccess={handleStaffLoginSuccess}
              onNavigate={handleNavigate}
              initialMode="participant"
            />
          );
        }
        if (currentView === 'login-reception') {
          return (
            <Login
              participants={participants}
              staffUsers={staffUsers}
              onLoginSuccess={handleLoginSuccess}
              onStaffLoginSuccess={handleStaffLoginSuccess}
              onNavigate={handleNavigate}
              initialMode="reception"
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
            />
          );
        }
        // Fallback to login if no active user session
        return (
          <Login
            participants={participants}
            staffUsers={staffUsers}
            onLoginSuccess={handleLoginSuccess}
            onStaffLoginSuccess={handleStaffLoginSuccess}
            onNavigate={handleNavigate}
            initialMode="participant"
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
