import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  SectionList,
  KeyboardAvoidingView,
  Keyboard,
  ListRenderItem
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Types & Interfaces ---
interface Destination {
  id: string;
  name: string;
  day: number;
  completed: boolean;
  selectedForDistance: boolean;
}

interface SectionData {
  title: string;
  data: Destination[];
}

// --- Constants ---
const STORAGE_KEY = 'tour_planner_data_ts_v3';
const MAX_SELECTION = 2;

export default function TourPlannerScreen() {
  // --- State ---
  const [destinations, setDestinations] = useState<Destination[]>([
    { id: '1', name: "Ajodhya Hill Top", day: 1, completed: false, selectedForDistance: false },
    { id: '2', name: "Mayur Pahar", day: 1, completed: false, selectedForDistance: false },
    { id: '3', name: "Bamni Falls", day: 1, completed: false, selectedForDistance: false },
    { id: '9', name: "Lohoria Temple", day: 1, completed: false, selectedForDistance: false },
    { id: '10', name: "Lohoria Dam", day: 1, completed: false, selectedForDistance: false },
    { id: '11', name: "Lower Dam", day: 1, completed: false, selectedForDistance: false },
    { id: '12', name: "Upper Dam", day: 1, completed: false, selectedForDistance: false },
    { id: '13', name: "Ram Mandir", day: 1, completed: false, selectedForDistance: false },
    { id: '14', name: "Sita Kundo", day: 1, completed: false, selectedForDistance: false },
    { id: '15', name: "Wooden Durga Temple", day: 1, completed: false, selectedForDistance: false },
    { id: '4', name: "Turga Falls", day: 2, completed: false, selectedForDistance: false },
    { id: '5', name: "Turga Dam", day: 2, completed: false, selectedForDistance: false },
    { id: '6', name: "Matha Forest", day: 2, completed: false, selectedForDistance: false },
    { id: '16', name: "Ushuldungri View Point", day: 2, completed: false, selectedForDistance: false },
    { id: '17', name: "Murguma Dam", day: 2, completed: false, selectedForDistance: false },
    { id: '18', name: "Marble Lake", day: 2, completed: false, selectedForDistance: false },
    { id: '7', name: "Upper Dam Viewpoint", day: 3, completed: false, selectedForDistance: false },
    { id: '8', name: "Lower Dam Viewpoint", day: 3, completed: false, selectedForDistance: false },
    { id: '19', name: "Ghagkocha Falls", day: 3, completed: false, selectedForDistance: false },
    { id: '20', name: "Khoirabera Dam", day: 3, completed: false, selectedForDistance: false },
    { id: '21', name: "Chemtaburu Range", day: 3, completed: false, selectedForDistance: false },
    { id: '22', name: "Pakhi Pahar", day: 3, completed: false, selectedForDistance: false },
    { id: '23', name: "Padri Dam", day: 3, completed: false, selectedForDistance: false },
    { id: '24', name: "Chhorida Chhou Mukhosh Gramg", day: 3, completed: false, selectedForDistance: false },
  ]);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  // --- Effects ---
  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    if (isReady) {
      saveState();
    }
  }, [destinations, isReady]);

  // --- Persistence ---
  const saveState = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(destinations));
    } catch (e) {
      console.log('Failed to save', e);
    }
  };

  const loadState = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setDestinations(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Failed to load', e);
    } finally {
      setIsReady(true);
    }
  };

  // --- Helpers ---
  const getSelected = () => destinations.filter(d => d.selectedForDistance);

  const showWarning = (msg: string) => {
    setWarningMsg(msg);
    setTimeout(() => setWarningMsg(null), 3000);
  };

  // --- Actions ---
  const toggleComplete = (id: string) => {
    setDestinations(prev => prev.map(d => 
      d.id === id ? { ...d, completed: !d.completed } : d
    ));
  };

  const toggleSelection = (id: string) => {
    const dest = destinations.find(d => d.id === id);
    if (!dest) return;

    const selectedCount = getSelected().length;

    if (!dest.selectedForDistance && selectedCount >= MAX_SELECTION) {
      showWarning("Max 2 locations for distance");
      return;
    }

    setDestinations(prev => prev.map(d => 
      d.id === id ? { ...d, selectedForDistance: !d.selectedForDistance } : d
    ));
  };

  const openMaps = () => {
    const selected = getSelected();
    if (selected.length === 2) {
      const d1 = encodeURIComponent(selected[0].name);
      const d2 = encodeURIComponent(selected[1].name);
      const url = `https://www.google.com/maps/dir/${d1}/${d2}`;
      Linking.openURL(url);
      
      setDestinations(prev => prev.map(d => ({...d, selectedForDistance: false})));
    }
  };

  const addNewDestination = () => {
    const maxDay = destinations.length > 0 ? Math.max(...destinations.map(d => d.day || 1)) : 1;
    
    const newDest: Destination = {
      id: Date.now().toString(),
      name: "",
      day: maxDay,
      completed: false,
      selectedForDistance: false
    };
    setDestinations([...destinations, newDest]);
  };

  const updateDestination = (id: string, field: keyof Destination, value: string | number) => {
    setDestinations(prev => prev.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const deleteDestination = (id: string) => {
    Alert.alert("Remove Destination", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => {
        setDestinations(prev => prev.filter(d => d.id !== id));
      }}
    ]);
  };

  // --- Data Prep for SectionList ---
  const sections: SectionData[] = useMemo(() => {
    const sorted = [...destinations].sort((a, b) => (a.day || 0) - (b.day || 0));
    
    const grouped: { [key: number]: Destination[] } = {};
    sorted.forEach(d => {
      const day = d.day || 1;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(d);
    });

    return Object.keys(grouped).map(day => ({
      title: `Day ${day}`,
      data: grouped[parseInt(day)]
    }));
  }, [destinations]);

  // --- Renderers ---
  const renderItem: ListRenderItem<Destination> = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={[styles.itemRow, item.completed && styles.itemRowCompleted]} 
      onPress={() => toggleComplete(item.id)}
    >
      <View style={styles.leftContent}>
        <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        
        <Text style={[styles.itemText, item.completed && styles.itemTextCompleted]}>
          {item.name}
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.circleCheck, item.selectedForDistance && styles.circleCheckSelected]}
        onPress={(e) => {
          e.stopPropagation();
          toggleSelection(item.id);
        }}
      >
        {item.selectedForDistance && <View style={styles.circleDot} />}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title.toUpperCase()}</Text>
    </View>
  );

  // --- Main Layout ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f766e" />
      
      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          ✈️ Tour Planner
        </Text>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => setIsEditMode(!isEditMode)}
        >
          <Text style={styles.editBtnText}>{isEditMode ? "Done" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      {/* Mode Switch Logic */}
      {!isEditMode ? (
        // --- VIEW MODE ---
        <View style={{flex: 1}}>
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            stickySectionHeadersEnabled={true}
            contentContainerStyle={{paddingBottom: 100}}
          />

          {/* Warning Toast */}
          {warningMsg && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>⚠️ {warningMsg}</Text>
            </View>
          )}

          {/* Bottom Action Bar */}
          {getSelected().length === 2 && (
            <View style={styles.bottomBar}>
              <TouchableOpacity 
                onPress={openMaps} 
                activeOpacity={0.9}
                style={styles.distanceBtn}
              >
                <Text style={styles.distanceBtnText}>📍 Calculate Distance</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        // --- EDIT MODE ---
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{flex: 1}}
        >
          <ScrollView contentContainerStyle={styles.editScroll}>
            <View style={styles.tipBox}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>
                <Text style={{fontWeight: 'bold'}}>Tip:</Text> Change the "Day" number to move destinations.
              </Text>
            </View>

            {[...destinations]
              .sort((a, b) => (a.day || 0) - (b.day || 0))
              .map((item) => (
              <View key={item.id} style={styles.editRow}>
                <View style={styles.dayInputWrap}>
                  <Text style={styles.inputLabel}>DAY</Text>
                  <TextInput
                    style={styles.dayInput}
                    value={String(item.day || '')}
                    keyboardType="number-pad"
                    onChangeText={(val) => updateDestination(item.id, 'day', parseInt(val) || 0)}
                  />
                </View>

                <View style={styles.nameInputWrap}>
                  <Text style={styles.inputLabel}>DESTINATION NAME</Text>
                  <TextInput
                    style={styles.nameInput}
                    value={item.name}
                    onChangeText={(val) => updateDestination(item.id, 'name', val)}
                    placeholder="Enter name"
                  />
                </View>

                <TouchableOpacity 
                  style={styles.deleteBtn} 
                  onPress={() => deleteDestination(item.id)}
                >
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addBtn} onPress={addNewDestination}>
              <Text style={styles.addBtnText}>➕ Add Destination</Text>
            </TouchableOpacity>

            <View style={{height: 60}} />
          </ScrollView>

          {/* Save Button */}
          <View style={styles.saveBar}>
            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={() => {
                Keyboard.dismiss();
                setIsEditMode(false);
              }}
            >
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    backgroundColor: '#012fd7ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff', 
    letterSpacing: -0.5,
  },
  editBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editBtnText: {
    color: '#000000ff',
    fontWeight: '700',
    fontSize: 14,
  },
  // Section List
  sectionHeader: {
    backgroundColor: 'rgba(249, 250, 251, 0.95)', 
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  sectionHeaderText: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  // Row Item
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    backgroundColor: '#ffffff',
  },
  itemRowCompleted: {
    backgroundColor: '#fafafa',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  // Custom Checkbox
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1', 
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0d9488',
    borderColor: '#0d9488',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: -2,
  },
  // Text
  itemText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8', 
  },
  // Circle Checkbox
  circleCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0d9488',
    marginLeft: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCheckSelected: {
    backgroundColor: '#0d9488',
    borderColor: '#0f766e',
  },
  circleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  distanceBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#0d9488',
  },
  distanceBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Warning
  warningContainer: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: '#fff7ed', 
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  warningText: {
    color: '#c2410c', 
    fontWeight: '600',
  },
  // Edit Mode Styles
  editScroll: {
    padding: 20,
    paddingBottom: 100,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff', 
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginBottom: 24,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    color: '#1e40af', 
    fontSize: 14,
    lineHeight: 20,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dayInputWrap: {
    width: 50,
    marginRight: 12,
  },
  nameInputWrap: {
    flex: 1,
    marginRight: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 4,
  },
  dayInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1f2937',
    height: 40,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#1f2937',
    height: 40,
  },
  deleteBtn: {
    marginTop: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef2f2', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#ef4444', 
    fontSize: 14,
    fontWeight: 'bold',
  },
  addBtn: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addBtnText: {
    color: '#6b7280',
    fontWeight: '700',
    fontSize: 16,
  },
  saveBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  saveBtn: {
    backgroundColor: '#0f766e', 
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0f766e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});