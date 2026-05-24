import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext({});

export const DARK = {
  bg:       '#0E0A08',
  card:     '#1E1612',
  card2:    '#2A1E18',
  hdr:      '#0E0A08',
  txt:      '#F0E8D8',
  txt2:     '#B0A090',
  txt3:     '#7A6A5A',
  bd:       'rgba(201,168,76,0.2)',
  inp:      '#160E0A',
  or:       '#C9A84C',
  orl:      'rgba(201,168,76,0.14)',
  bord:     '#E05A6A',
bordl:    'rgba(224,90,106,0.2)',
  gr:       '#2D7A4F',
  grl:      'rgba(45,122,79,0.2)',
  nav:      '#0E0A08',
  isDark:   true,
};

export const LIGHT = {
  bg:       '#F5F0E8',
  card:     '#FFFFFF',
  card2:    '#FAF6EF',
  hdr:      '#FFFFFF',
  txt:      '#1A1410',
  txt2:     '#6A5A48',
  txt3:     '#9A8A78',
  bd:       '#E0D4C0',
  inp:      '#FAF6EF',
  or:       '#A67C2A',
  orl:      '#FFF3D0',
  bord:     '#8B1A2A',
  bordl:    '#FDE8EB',
  gr:       '#2D7A4F',
  grl:      '#E8F5EE',
  nav:      '#FFFFFF',
  isDark:   false,
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? DARK : LIGHT;
  const toggleTheme = () => setIsDark(d => !d);
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
