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
import Icon from "react-native-vector-icons/FontAwesome";
import { Item } from "types"; 
import { useDataContext } from "./DataContext"; // <-- Import the custom hook

type EditableItem = Item & { isEditing: boolean; costInput?: string };

type ItemsModalProps = {
  modalVisible: boolean;
  // We remove "items" from props
  // We also remove "handleCloseModal: (newItems: Item[]) => void"
  // We'll replace it with a simpler "handleCloseModal: () => void"
  handleCloseModal: () => void;
};

const ItemsModal: React.FC<ItemsModalProps> = ({
  modalVisible,
  handleCloseModal,
}) => {
  // 1) Read items + setter from context
  const { items, setItems } = useDataContext();

  // 2) Make a local copy of items with an 'isEditing' flag so we can edit them internally:
  const [editableItems, setEditableItems] = useState<EditableItem[]>(
    () =>
      items.map((item) => ({
        ...item,
        isEditing: false,
        costInput: item.cost?.toString() || "0",
      })) || []
  );

  // 3) Called when user presses 'Save' on the entire modal
  const handleSaveAndClose = () => {
    // Convert local editing state into final Item[] shape
    const finalItems = editableItems.map(({ isEditing, costInput, ...rest }) => {
      // Make sure we store the numeric cost properly
      const parsedCost = parseFloat(costInput || "0");
      return {
        ...rest,
        cost: isNaN(parsedCost) ? 0 : parsedCost,
      };
    });

    // 4) Update context
    setItems(finalItems);

    // 5) Tell parent to close the modal (just hides it)
    handleCloseModal();
  };

  // Toggle edit mode for an individual item
  const toggleEditItem = (index: number) => {
    setEditableItems((prev) => {
      const updated = [...prev];
      if (updated[index].isEditing) {
        // We are about to switch off "edit" mode,
        // so parse costInput as a float.
        const parsedCost = parseFloat(updated[index].costInput || "0");
        updated[index].cost = isNaN(parsedCost) ? 0 : parsedCost;
      } else {
        // We are about to switch to "edit" mode,
        // sync costInput with current cost for editing.
        updated[index].costInput = updated[index].cost.toString();
      }
      updated[index].isEditing = !updated[index].isEditing;
      return updated;
    });
  };

  // Handle name changes for an item
  const handleNameChange = (index: number, newName: string) => {
    setEditableItems((prev) => {
      const updated = [...prev];
      updated[index].item = newName;
      return updated;
    });
  };

  // Handle cost changes for an item
  const handleCostChange = (index: number, newCost: string) => {
    setEditableItems((prev) => {
      const updated = [...prev];
      updated[index].costInput = newCost;
      return updated;
    });
  };

  // Add a new item, set it to editing mode
  const handleAddItem = () => {
    setEditableItems((prev) => [
      ...prev,
      {
        item: "",
        cost: 0,
        isEditing: true,
        costInput: "0",
      } as EditableItem,
    ]);
  };

  // Delete an item from the list
  const handleDeleteItem = (index: number) => {
    setEditableItems((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
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
          {editableItems.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              {item.isEditing ? (
                <>
                  <TextInput
                    style={styles.textInput}
                    value={item.item}
                    onChangeText={(text) => handleNameChange(index, text)}
                    placeholder="Item name"
                    placeholderTextColor="#888"
                  />
                  <TextInput
                    style={styles.textInput}
                    value={item.costInput} // costInput string
                    onChangeText={(text) => handleCostChange(index, text)}
                    keyboardType="decimal-pad"
                    placeholder="Cost"
                    placeholderTextColor="#888"
                  />
                  {/* Save button (text-based) */}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => toggleEditItem(index)}
                  >
                    <Text style={styles.editButtonText}>Save</Text>
                  </TouchableOpacity>

                  {/* Delete button (trash icon) */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(index)}
                  >
                    <Icon name="trash" size={18} color="white" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.itemText}>
                    {item.item}: ${item.cost?.toFixed(2)}
                  </Text>

                  {/* Edit button replaced with a pencil icon */}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => toggleEditItem(index)}
                  >
                    <Icon name="pencil" size={18} color="white" />
                  </TouchableOpacity>

                  {/* Delete button (trash icon) */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(index)}
                  >
                    <Icon name="trash" size={18} color="white" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
};

export default ItemsModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
  deleteButton: {
    backgroundColor: "red",
    padding: 6,
    borderRadius: 5,
    marginLeft: 8,
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
