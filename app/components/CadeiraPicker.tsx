// components/CadeiraPicker.tsx
import React from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export interface ICadeira {
  id: number;
  nome: string;
}

interface CadeiraPickerProps {
  visible: boolean;
  cadeiras: ICadeira[];
  onSelect: (cadeira: ICadeira) => void;
  onClose: () => void;
}

export const CadeiraPicker: React.FC<CadeiraPickerProps> = ({ visible, cadeiras, onSelect, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Escolha uma Cadeira</Text>
          <FlatList
            data={cadeiras}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                <Text style={styles.modalItemText}>{item.nome}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    width: '80%', 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 10 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  modalItem: { 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ddd' 
  },
  modalItemText: { 
    fontSize: 16 
  },
  closeButton: { 
    backgroundColor: '#007AFF', 
    padding: 10, 
    borderRadius: 5, 
    marginTop: 10, 
    alignItems: 'center' 
  },
  closeButtonText: { 
    color: '#fff', 
    fontSize: 16 
  },
});
// ... seu componente NotificationModal
export default CadeiraPicker;
