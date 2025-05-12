
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
  createHomeProfile: (profile: Omit<HomeProfile, 'id' | 'userId'>) => void;
  updateHomeProfile: (profile: Partial<HomeProfile>) => void;
  addAppliance: (appliance: Omit<Appliance, 'id' | 'homeProfileId'>) => void;
  updateAppliance: (id: string, appliance: Partial<Appliance>) => void;
  deleteAppliance: (id: string) => void;
  addServiceRecord: (record: Omit<ServiceRecord, 'id'>) => void;
  updateServiceRecord: (id: string, record: Partial<ServiceRecord>) => void;
  deleteServiceRecord: (id: string) => void;
  addReminder: (reminder: Omit<MaintenanceReminder, 'id'>) => void;
  updateReminder: (id: string, reminder: Partial<MaintenanceReminder>) => void;
  deleteReminder: (id: string) => void;
  markReminderComplete: (id: string) => void;
  getApplianceById: (id: string) => Appliance | undefined;
  getServiceRecordsByApplianceId: (applianceId: string) => ServiceRecord[];
  getRemindersByApplianceId: (applianceId: string) => MaintenanceReminder[];
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data generator functions
function generateMockUser(): User {
  return {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Demo User'
  };
}

function generateMockHomeProfile(): HomeProfile {
  return {
    id: 'home-1',
    address: '123 Main Street, Anytown, CA 12345',
    constructionYear: 1995,
    userId: 'user-1',
    images: ['/placeholder.svg']
  };
}

function generateMockAppliances(): Appliance[] {
  return [
    {
      id: 'appliance-1',
      name: 'Whirlpool Refrigerator',
      category: ApplianceCategory.KITCHEN,
      purchaseDate: '2021-05-15',
      warrantyExpirationDate: '2026-05-15',
      notes: 'French door style with water dispenser',
      homeProfileId: 'home-1'
    },
    {
      id: 'appliance-2',
      name: 'LG Washing Machine',
      category: ApplianceCategory.LAUNDRY,
      purchaseDate: '2020-02-10',
      warrantyExpirationDate: '2023-02-10',
      notes: 'Front-loading, energy efficient',
      homeProfileId: 'home-1'
    },
    {
      id: 'appliance-3',
      name: 'Lennox HVAC System',
      category: ApplianceCategory.HVAC,
      purchaseDate: '2018-07-20',
      warrantyExpirationDate: '2023-07-20',
      notes: '3-ton capacity, 16 SEER rating',
      homeProfileId: 'home-1'
    }
  ];
}

function generateMockServiceRecords(): ServiceRecord[] {
  return [
    {
      id: 'service-1',
      applianceId: 'appliance-3',
      date: '2022-05-12',
      serviceType: ServiceType.MAINTENANCE,
      providerName: 'Cool Air Services',
      providerContact: '555-123-4567',
      cost: 150,
      notes: 'Annual maintenance and filter replacement'
    },
    {
      id: 'service-2',
      applianceId: 'appliance-2',
      date: '2022-08-05',
      serviceType: ServiceType.REPAIR,
      providerName: 'Appliance Fix-It',
      providerContact: '555-987-6543',
      cost: 220,
      notes: 'Replaced drain pump'
    }
  ];
}

function generateMockReminders(): MaintenanceReminder[] {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  
  return [
    {
      id: 'reminder-1',
      applianceId: 'appliance-3',
      title: 'HVAC Filter Replacement',
      description: 'Replace air filters throughout the house',
      dueDate: nextWeek.toISOString().split('T')[0],
      recurring: true,
      recurrencePattern: '3M', // Every 3 months
      completed: false
    },
    {
      id: 'reminder-2',
      applianceId: 'appliance-1',
      title: 'Clean Refrigerator Coils',
      description: 'Clean coils on the back of the refrigerator',
      dueDate: nextMonth.toISOString().split('T')[0],
      recurring: true,
      recurrencePattern: '6M', // Every 6 months
      completed: false
    }
  ];
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [homeProfile, setHomeProfile] = useState<HomeProfile | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Mock authentication
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'demo@example.com' && password === 'password') {
        const user = generateMockUser();
        const homeProfile = generateMockHomeProfile();
        const appliances = generateMockAppliances();
        const serviceRecords = generateMockServiceRecords();
        const reminders = generateMockReminders();
        
        setUser(user);
        setHomeProfile(homeProfile);
        setAppliances(appliances);
        setServiceRecords(serviceRecords);
        setReminders(reminders);
        setIsAuthenticated(true);
        
        localStorage.setItem('user', JSON.stringify(user));
        toast({
          title: "Login successful",
          description: "Welcome back to your Home Maintenance Logbook!",
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = {
        id: `user-${Date.now()}`,
        email,
        name,
      };
      
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast({
        title: "Registration successful",
        description: "Welcome to your Home Maintenance Logbook!",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again later",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setHomeProfile(null);
    setAppliances([]);
    setServiceRecords([]);
    setReminders([]);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const createHomeProfile = (profile: Omit<HomeProfile, 'id' | 'userId'>) => {
    if (!user) return;
    
    const newProfile: HomeProfile = {
      ...profile,
      id: `home-${Date.now()}`,
      userId: user.id
    };
    
    setHomeProfile(newProfile);
    toast({
      title: "Home profile created",
      description: "Your home profile has been successfully created",
    });
  };

  const updateHomeProfile = (profile: Partial<HomeProfile>) => {
    if (!homeProfile) return;
    
    const updatedProfile = {
      ...homeProfile,
      ...profile
    };
    
    setHomeProfile(updatedProfile);
    toast({
      title: "Home profile updated",
      description: "Your home profile has been successfully updated",
    });
  };

  const addAppliance = (appliance: Omit<Appliance, 'id' | 'homeProfileId'>) => {
    if (!homeProfile) return;
    
    const newAppliance: Appliance = {
      ...appliance,
      id: `appliance-${Date.now()}`,
      homeProfileId: homeProfile.id
    };
    
    setAppliances([...appliances, newAppliance]);
    toast({
      title: "Appliance added",
      description: `${newAppliance.name} has been added to your inventory`,
    });
  };

  const updateAppliance = (id: string, appliance: Partial<Appliance>) => {
    const updatedAppliances = appliances.map(a => 
      a.id === id ? { ...a, ...appliance } : a
    );
    
    setAppliances(updatedAppliances);
    toast({
      title: "Appliance updated",
      description: "Your appliance has been successfully updated",
    });
  };

  const deleteAppliance = (id: string) => {
    // Delete associated service records and reminders first
    setServiceRecords(serviceRecords.filter(sr => sr.applianceId !== id));
    setReminders(reminders.filter(r => r.applianceId !== id));
    
    // Then delete the appliance
    setAppliances(appliances.filter(a => a.id !== id));
    toast({
      title: "Appliance deleted",
      description: "The appliance and all associated records have been deleted",
    });
  };

  const addServiceRecord = (record: Omit<ServiceRecord, 'id'>) => {
    const newRecord: ServiceRecord = {
      ...record,
      id: `service-${Date.now()}`
    };
    
    setServiceRecords([...serviceRecords, newRecord]);
    toast({
      title: "Service record added",
      description: "Your service record has been successfully added",
    });
  };

  const updateServiceRecord = (id: string, record: Partial<ServiceRecord>) => {
    const updatedRecords = serviceRecords.map(sr => 
      sr.id === id ? { ...sr, ...record } : sr
    );
    
    setServiceRecords(updatedRecords);
    toast({
      title: "Service record updated",
      description: "Your service record has been successfully updated",
    });
  };

  const deleteServiceRecord = (id: string) => {
    setServiceRecords(serviceRecords.filter(sr => sr.id !== id));
    toast({
      title: "Service record deleted",
      description: "Your service record has been successfully deleted",
    });
  };

  const addReminder = (reminder: Omit<MaintenanceReminder, 'id'>) => {
    const newReminder: MaintenanceReminder = {
      ...reminder,
      id: `reminder-${Date.now()}`
    };
    
    setReminders([...reminders, newReminder]);
    toast({
      title: "Reminder added",
      description: "Your maintenance reminder has been scheduled",
    });
  };

  const updateReminder = (id: string, reminder: Partial<MaintenanceReminder>) => {
    const updatedReminders = reminders.map(r => 
      r.id === id ? { ...r, ...reminder } : r
    );
    
    setReminders(updatedReminders);
    toast({
      title: "Reminder updated",
      description: "Your maintenance reminder has been updated",
    });
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
    toast({
      title: "Reminder deleted",
      description: "Your maintenance reminder has been deleted",
    });
  };

  const markReminderComplete = (id: string) => {
    const updatedReminders = reminders.map(r => 
      r.id === id ? { ...r, completed: true } : r
    );
    
    setReminders(updatedReminders);
    toast({
      title: "Reminder completed",
      description: "Your maintenance task has been marked as completed",
    });
  };

  const getApplianceById = (id: string) => {
    return appliances.find(a => a.id === id);
  };

  const getServiceRecordsByApplianceId = (applianceId: string) => {
    return serviceRecords.filter(sr => sr.applianceId === applianceId);
  };

  const getRemindersByApplianceId = (applianceId: string) => {
    return reminders.filter(r => r.applianceId === applianceId);
  };

  // Check for existing user session
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      
      // Fetch demo data for the logged in user
      setHomeProfile(generateMockHomeProfile());
      setAppliances(generateMockAppliances());
      setServiceRecords(generateMockServiceRecords());
      setReminders(generateMockReminders());
    }
  }, []);

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
