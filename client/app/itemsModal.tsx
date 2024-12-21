import React, { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Item } from "types"; // your custom type definition

type EditableItem = Item & { isEditing: boolean };

type ItemsModalProps = {
  modalVisible: boolean;
  items: Item[]; // Initially parsed from parent
  handleCloseModal: (newItems: Item[]) => void;
};

const ItemsModal: React.FC<ItemsModalProps> = ({
  items,
  modalVisible,
  handleCloseModal,
}) => {
  // Make a local copy of items with an 'isEditing' flag
  const [editableItems, setEditableItems] = useState<EditableItem[]>(
    items.map((item) => ({
      ...item,
      isEditing: false,
    }))
  );

  // Called when user presses 'Save' on the entire modal
  const handleSaveAndClose = () => {
    // Strip out isEditing before passing back to parent
    const finalItems = editableItems.map(({ isEditing, ...rest }) => rest);
    handleCloseModal(finalItems);
  };

  // Toggle edit mode for an individual item
  const toggleEditItem = (index: number) => {
    setEditableItems((prev) => {
      const updated = [...prev];
      updated[index].isEditing = !updated[index].isEditing;
      return updated;
    });
  };

  // Handle name changes for an item
  const handleNameChange = (index: number, newName: string) => {
    setEditableItems((prev) => {
      const updated = [...prev];
      updated[index].item = newName; // or updated[index].name, depending on your `Item` shape
      return updated;
    });
  };

  // Handle cost changes for an item
  const handleCostChange = (index: number, newCost: string) => {
    // Validate or parse float if needed
    const cost = parseFloat(newCost) || 0;
    setEditableItems((prev) => {
      const updated = [...prev];
      updated[index].cost = cost;
      return updated;
    });
  };

  // Add a new (empty) item, set it to editing mode
  const handleAddItem = () => {
    setEditableItems((prev) => [
      ...prev,
      {
        item: "",    // or name: ""
        cost: 0,
        isEditing: true,
      } as EditableItem,
    ]);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleSaveAndClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Save button */}
          <Pressable style={styles.closeButton} onPress={handleSaveAndClose}>
            <Text style={styles.closeText}>Save</Text>
          </Pressable>

          {/* Plus button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>

          {/* Render all items */}
          {editableItems.map((item, index) => {
            return (
              <View key={index} style={styles.itemRow}>
                {item.isEditing ? (
                  <>
                    {/* Editable TextInput for the Item Name */}
                    <TextInput
                      style={styles.textInput}
                      value={item.item} // or item.name
                      onChangeText={(text) => handleNameChange(index, text)}
                      placeholder="Item name"
                      placeholderTextColor="#888"
                    />

                    {/* Editable TextInput for the Item Cost */}
                    <TextInput
                      style={styles.textInput}
                      value={item.cost?.toString()}
                      onChangeText={(text) => handleCostChange(index, text)}
                      keyboardType="decimal-pad"
                      placeholder="Cost"
                      placeholderTextColor="#888"
                    />

                    {/* Save button */}
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => toggleEditItem(index)}
                    >
                      <Text style={styles.editButtonText}>Save</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {/* Display the current Item Name and Cost */}
                    <Text style={styles.itemText}>
                      {item.item}: ${item.cost?.toFixed(2)}
                    </Text>

                    {/* Edit button */}
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => toggleEditItem(index)}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
    backgroundColor: "blue",
    borderRadius: 5,
    marginBottom: 16,
  },
  closeText: {
    color: "white",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "green",
    padding: 6,
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemText: {
    flex: 1,
    color: "black",
    fontSize: 16,
  },
  editButton: {
    backgroundColor: "orange",
    padding: 6,
    borderRadius: 5,
    marginLeft: 8,
  },
  editButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  textInput: {
    flex: 1,
    marginRight: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    color: "black",
  },
});

export default ItemsModal;
