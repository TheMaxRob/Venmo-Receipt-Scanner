import React, { createContext, useState, useContext } from "react";
import { Friend, Item } from "types";

interface DataContextType {
  items: Item[];
  friends: Friend[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);

  return (
    <DataContext.Provider value={{ items, setItems, friends, setFriends }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};
