import React, { createContext, useContext, useState } from 'react';

// Default initial citizen profile state
const initialCitizenProfile = {
  name: 'Tanmay Awad',
  age: 28,
  gender: 'Female',
  state: 'Maharashtra',
  district: 'Pune',
  income: 180000,
  occupation: 'Farmer',
  education: 'Graduate',
  category: 'OBC',
  farmer: 1,
  student: 0,
  business: 0,
  disability: 0,
  widow: 0,
  minority: 0,
};

// Create Context with safe default value
const CitizenContext = createContext({
  citizenProfile: initialCitizenProfile,
  profile: initialCitizenProfile,
  setCitizenProfile: () => {},
  setProfile: () => {},
  updateProfile: () => {},
  clearCitizenProfile: () => {},
});

/**
 * CitizenProvider component to wrap application tree.
 */
export function CitizenProvider({ children }) {
  const [citizenProfile, setCitizenProfile] = useState(initialCitizenProfile);

  const updateProfile = (updatedFields) => {
    setCitizenProfile((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  const clearCitizenProfile = () => {
    setCitizenProfile({
      name: '',
      age: '',
      gender: 'All',
      state: 'All India',
      district: '',
      income: '',
      occupation: 'General/Unspecified',
      education: 'All',
      category: 'General',
      farmer: 0,
      student: 0,
      business: 0,
      disability: 0,
      widow: 0,
      minority: 0,
    });
  };

  return (
    <CitizenContext.Provider
      value={{
        citizenProfile,
        profile: citizenProfile, // Alias for convenient destructuring
        setCitizenProfile,
        setProfile: setCitizenProfile, // Alias for convenient destructuring
        updateProfile,
        clearCitizenProfile,
      }}
    >
      {children}
    </CitizenContext.Provider>
  );
}

/**
 * Custom hook to access CitizenContext.
 * Returns safe fallback if invoked outside CitizenProvider.
 */
export function useCitizen() {
  const context = useContext(CitizenContext);
  if (!context) {
    console.warn('[useCitizen] Hook used outside CitizenProvider. Returning default state.');
    return {
      citizenProfile: initialCitizenProfile,
      profile: initialCitizenProfile,
      setCitizenProfile: () => {},
      setProfile: () => {},
      updateProfile: () => {},
      clearCitizenProfile: () => {},
    };
  }
  return context;
}
