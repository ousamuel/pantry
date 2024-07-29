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
}

export default function Home() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [newItem, setNewItem] = useState<string>("");

  const fetchItems = async () => {
    const querySnapshot = await getDocs(collection(db, "pantryItems"));
    const itemsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      counter: doc.data().counter,
    }));
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
    const { counter } = docSnap.data() as {counter:number};
    if (counter == 1 && increment == false) {
      await handleDeleteItem(name);
      return;
    }

    await updateDoc(docRef, {
      counter: increment ? counter + 1 : counter - 1,
    });

    fetchItems();
  };

  useEffect(() => {
    fetchItems();
  }, []);
  return (
    <main className="h-[100vh] p-10 flex flex-col items-center">
      <Container maxWidth="sm">
        <h1>Pantry App</h1>
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
        {items.length < 1 ? (
          <h2 className="text-center opacity-50 my-4">No Items Yet</h2>
        ) : null}
        <List>
          {items.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={`${item.name} (Quantity: ${item.counter})`}
              />
              <IconButton onClick={() => handleUpdateCounter(item.name, true)}>
                +
              </IconButton>
              <IconButton onClick={() => handleUpdateCounter(item.name, false)}>
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
