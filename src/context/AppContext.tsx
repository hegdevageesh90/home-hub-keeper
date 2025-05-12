
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  HomeProfile, 
  Appliance, 
  ServiceRecord, 
  MaintenanceReminder, 
  ApplianceCategory,
  ServiceType 
} from '../types';
import { useToast } from '../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { homeProfilesApi, appliancesApi, serviceRecordsApi, remindersApi } from '@/api';

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  homeProfile: HomeProfile | null;
  appliances: Appliance[];
  serviceRecords: ServiceRecord[];
  reminders: MaintenanceReminder[];
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  createHomeProfile: (profile: Omit<HomeProfile, 'id' | 'userId'>) => Promise<void>;
  updateHomeProfile: (profile: Partial<HomeProfile>) => Promise<void>;
  addAppliance: (appliance: Omit<Appliance, 'id' | 'homeProfileId'>) => Promise<void>;
  updateAppliance: (id: string, appliance: Partial<Appliance>) => Promise<void>;
  deleteAppliance: (id: string) => Promise<void>;
  addServiceRecord: (record: Omit<ServiceRecord, 'id'>) => Promise<void>;
  updateServiceRecord: (id: string, record: Partial<ServiceRecord>) => Promise<void>;
  deleteServiceRecord: (id: string) => Promise<void>;
  addReminder: (reminder: Omit<MaintenanceReminder, 'id'>) => Promise<void>;
  updateReminder: (id: string, reminder: Partial<MaintenanceReminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  markReminderComplete: (id: string) => Promise<void>;
  getApplianceById: (id: string) => Appliance | undefined;
  getServiceRecordsByApplianceId: (applianceId: string) => ServiceRecord[];
  getRemindersByApplianceId: (applianceId: string) => MaintenanceReminder[];
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [homeProfile, setHomeProfile] = useState<HomeProfile | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();

  // Setup Supabase auth listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'User'
        } : null);
        setIsAuthenticated(!!session?.user);
        
        // Fetch user data if authenticated
        if (session?.user) {
          setTimeout(() => {
            fetchUserData();
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || 'User'
      } : null);
      setIsAuthenticated(!!session?.user);
      
      // Fetch user data if authenticated
      if (session?.user) {
        fetchUserData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user data from FastAPI backend
  const fetchUserData = async () => {
    try {
      // Fetch home profiles
      const homeProfilesData = await homeProfilesApi.getAll();
      if (homeProfilesData && homeProfilesData.length > 0) {
        setHomeProfile(homeProfilesData[0] as HomeProfile);
      }
      
      // Fetch appliances
      const appliancesData = await appliancesApi.getAll();
      setAppliances(appliancesData as Appliance[]);
      
      // Fetch service records
      const serviceRecordsData = await serviceRecordsApi.getAll();
      setServiceRecords(serviceRecordsData as ServiceRecord[]);
      
      // Fetch reminders
      const remindersData = await remindersApi.getAll();
      setReminders(remindersData as MaintenanceReminder[]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Data fetch failed",
        description: "There was an error loading your data.",
        variant: "destructive",
      });
    }
  };

  // Authentication functions
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "Welcome back to your Home Maintenance Logbook!",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Registration successful",
        description: "Welcome to your Home Maintenance Logbook!",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setHomeProfile(null);
      setAppliances([]);
      setServiceRecords([]);
      setReminders([]);
      setIsAuthenticated(false);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error during logout",
        variant: "destructive",
      });
    }
  };

  // Home profile functions
  const createHomeProfile = async (profile: Omit<HomeProfile, 'id' | 'userId'>) => {
    try {
      const createdProfile = await homeProfilesApi.create(profile);
      setHomeProfile(createdProfile as HomeProfile);
      toast({
        title: "Home profile created",
        description: "Your home profile has been successfully created",
      });
    } catch (error: any) {
      toast({
        title: "Failed to create profile",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateHomeProfile = async (profile: Partial<HomeProfile>) => {
    if (!homeProfile) return;
    
    try {
      const updatedProfile = await homeProfilesApi.update(homeProfile.id, profile);
      setHomeProfile({...homeProfile, ...updatedProfile} as HomeProfile);
      toast({
        title: "Home profile updated",
        description: "Your home profile has been successfully updated",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Appliance functions
  const addAppliance = async (appliance: Omit<Appliance, 'id' | 'homeProfileId'>) => {
    if (!homeProfile) return;
    
    try {
      const newAppliance = await appliancesApi.create({
        ...appliance,
        home_profile_id: homeProfile.id
      });
      
      setAppliances([...appliances, newAppliance as Appliance]);
      toast({
        title: "Appliance added",
        description: `${newAppliance.name} has been added to your inventory`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to add appliance",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAppliance = async (id: string, appliance: Partial<Appliance>) => {
    try {
      const updatedAppliance = await appliancesApi.update(id, appliance);
      setAppliances(appliances.map(a => 
        a.id === id ? { ...a, ...updatedAppliance } as Appliance : a
      ));
      toast({
        title: "Appliance updated",
        description: "Your appliance has been successfully updated",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAppliance = async (id: string) => {
    try {
      await appliancesApi.delete(id);
      
      // Delete associated service records and reminders from state
      setServiceRecords(serviceRecords.filter(sr => sr.applianceId !== id));
      setReminders(reminders.filter(r => r.applianceId !== id));
      
      // Delete the appliance from state
      setAppliances(appliances.filter(a => a.id !== id));
      toast({
        title: "Appliance deleted",
        description: "The appliance and all associated records have been deleted",
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Service record functions
  const addServiceRecord = async (record: Omit<ServiceRecord, 'id'>) => {
    try {
      const newRecord = await serviceRecordsApi.create(record);
      setServiceRecords([...serviceRecords, newRecord as ServiceRecord]);
      toast({
        title: "Service record added",
        description: "Your service record has been successfully added",
      });
    } catch (error: any) {
      toast({
        title: "Failed to add service record",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateServiceRecord = async (id: string, record: Partial<ServiceRecord>) => {
    try {
      const updatedRecord = await serviceRecordsApi.update(id, record);
      setServiceRecords(serviceRecords.map(sr => 
        sr.id === id ? { ...sr, ...updatedRecord } as ServiceRecord : sr
      ));
      toast({
        title: "Service record updated",
        description: "Your service record has been successfully updated",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteServiceRecord = async (id: string) => {
    try {
      await serviceRecordsApi.delete(id);
      setServiceRecords(serviceRecords.filter(sr => sr.id !== id));
      toast({
        title: "Service record deleted",
        description: "Your service record has been successfully deleted",
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Reminder functions
  const addReminder = async (reminder: Omit<MaintenanceReminder, 'id'>) => {
    try {
      const newReminder = await remindersApi.create(reminder);
      setReminders([...reminders, newReminder as MaintenanceReminder]);
      toast({
        title: "Reminder added",
        description: "Your maintenance reminder has been scheduled",
      });
    } catch (error: any) {
      toast({
        title: "Failed to add reminder",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateReminder = async (id: string, reminder: Partial<MaintenanceReminder>) => {
    try {
      const updatedReminder = await remindersApi.update(id, reminder);
      setReminders(reminders.map(r => 
        r.id === id ? { ...r, ...updatedReminder } as MaintenanceReminder : r
      ));
      toast({
        title: "Reminder updated",
        description: "Your maintenance reminder has been updated",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await remindersApi.delete(id);
      setReminders(reminders.filter(r => r.id !== id));
      toast({
        title: "Reminder deleted",
        description: "Your maintenance reminder has been deleted",
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const markReminderComplete = async (id: string) => {
    try {
      await remindersApi.markComplete(id);
      setReminders(reminders.map(r => 
        r.id === id ? { ...r, completed: true } as MaintenanceReminder : r
      ));
      toast({
        title: "Reminder completed",
        description: "Your maintenance task has been marked as completed",
      });
    } catch (error: any) {
      toast({
        title: "Failed to mark reminder as complete",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Utility functions
  const getApplianceById = (id: string) => {
    return appliances.find(a => a.id === id);
  };

  const getServiceRecordsByApplianceId = (applianceId: string) => {
    return serviceRecords.filter(sr => sr.applianceId === applianceId);
  };

  const getRemindersByApplianceId = (applianceId: string) => {
    return reminders.filter(r => r.applianceId === applianceId);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        homeProfile,
        appliances,
        serviceRecords,
        reminders,
        login,
        register,
        logout,
        createHomeProfile,
        updateHomeProfile,
        addAppliance,
        updateAppliance,
        deleteAppliance,
        addServiceRecord,
        updateServiceRecord,
        deleteServiceRecord,
        addReminder,
        updateReminder,
        deleteReminder,
        markReminderComplete,
        getApplianceById,
        getServiceRecordsByApplianceId,
        getRemindersByApplianceId,
        loading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
