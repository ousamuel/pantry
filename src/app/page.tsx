"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Box,
  Container,
  List,
  ListItemSecondaryAction,
  IconButton,
  ListItemButton,
  ListItemText,
  ListItem,
  Button,
  TextField,
  Checkbox,
} from "@mui/material";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  getDoc,
  setDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";
interface PantryItem {
  id: string;
  name: string;
  counter: number;
  checked: boolean;
}

export default function Home() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [newItem, setNewItem] = useState<string>("");
  const [searchBy, setSearchBy] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const fetchItems = async () => {
    const querySnapshot = await getDocs(collection(db, "pantryItems"));
    const itemsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      counter: doc.data().counter,
      checked: doc.data().checked,
    }));
    setLoading(false);
    setItems(itemsList);
  };
  const handleAddItem = async () => {
    if (!newItem.trim()) {
      return;
    }
    const docRef = doc(collection(db, "pantryItems"), newItem.trim());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      handleUpdateCounter(newItem.trim(), true);
      return;
    }
    await setDoc(docRef, {
      name: newItem.trim(),
      counter: 1,
      checked: false,
    });
    setNewItem("");
    fetchItems();
  };
  const handleDeleteItem = async (name: string) => {
    await deleteDoc(doc(db, "pantryItems", name));
    fetchItems();
  };
  const handleUpdateCounter = async (name: string, increment: boolean) => {
    const docRef = doc(collection(db, "pantryItems"), name);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return;
    }
    const { counter } = docSnap.data() as { counter: number };
    if (counter == 1 && increment == false) {
      await handleDeleteItem(name);
      return;
    }

    await updateDoc(docRef, {
      counter: increment ? counter + 1 : counter - 1,
    });

    fetchItems();
  };
  const handleChecked = async (id: string) => {
    const docRef = doc(collection(db, "pantryItems"), id);
    const docSnap = await getDoc(docRef);
    const { checked } = docSnap.data() as { checked: boolean };

    await updateDoc(docRef, {
      checked: !checked,
    });
    fetchItems();
  };
  useEffect(() => {
    fetchItems();
  }, []);
  return (
    <main className="h-[100vh] p-10 flex flex-col items-center">
      <Container maxWidth="sm">
        <div className="flex justify-between items-center">
          <h1>Pantry App</h1>
          <a
            className="text-blue-600 hover:bg-gray-400 
            hover:text-blue-500 rounded-sm px-2"
            target="_blank"
            href="https://ousamuel.vercel.app/"
          >
            Samuel Ou
          </a>
        </div>
        <TextField
          required
          label="New Item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddItem}
          style={{ marginTop: 16 }}
          fullWidth
        >
          Add Item
        </Button>
        <div className="flex items-center whitespace-nowrap my-4">
          <h2 className="mr-3">Filter items by: </h2>
          <TextField
            label="e.g. Tomato"
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            fullWidth
          />
        </div>
        {items.length < 1 && !loading ? (
          <h2 className="text-center opacity-50 my-4">No Items Yet</h2>
        ) : items.filter((item: any) =>
            item.name.toLowerCase().includes(searchBy.toLowerCase())
          ).length < 1 && !loading ? (
          <h2 className="text-center opacity-50 my-4">
            No pantry items match this search
          </h2>
        ) : null}
        <List>
          {items
            .filter((item: any) =>
              item.name.toLowerCase().includes(searchBy.toLowerCase())
            )
            .map((item) => (
              <ListItem key={item.id} divider>
                <Checkbox
                  checked={item.checked}
                  onChange={() => handleChecked(item.id)}
                />

                <ListItemText
                  primary={`${item.name} (Quantity: ${item.counter})`}
                />
                <IconButton
                  onClick={() => handleUpdateCounter(item.name, true)}
                >
                  +
                </IconButton>
                <IconButton
                  onClick={() => handleUpdateCounter(item.name, false)}
                >
                  -
                </IconButton>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    X
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
        </List>
      </Container>
    </main>
  );
}
