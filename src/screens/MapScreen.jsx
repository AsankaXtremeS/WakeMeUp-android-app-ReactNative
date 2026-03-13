import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Keyboard,
  FlatList, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../theme';

const { height } = Dimensions.get('window');

export default function MapScreen() {
  const navigation = useNavigation();
  const webViewRef = useRef(null);

  const [userLocation, setUserLocation] = useState({ latitude: 7.8731, longitude: 80.7718 });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [radiusKm, setRadiusKm] = useState(1);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
      }
      setLocationLoading(false);
    })();
  }, []);

  const sendToMap = (action, data) => {
    webViewRef.current?.injectJavaScript(`
      window.handleAction('${action}', ${JSON.stringify(data)});
      true;
    `);
  };

  useEffect(() => {
    if (mapReady && !locationLoading) {
      sendToMap('flyTo', { lat: userLocation.latitude, lng: userLocation.longitude });
    }
  }, [mapReady, locationLoading]);

  useEffect(() => {
    if (selectedLocation) sendToMap('updateRadius', { radiusKm });
  }, [radiusKm]);

  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ready') {
        setMapReady(true);
      } else if (data.type === 'locationUpdate') {
        setUserLocation({ latitude: data.lat, longitude: data.lng });
      } else if (data.type === 'mapClick') {
        const { lat, lng } = data;
        setSelectedLocation({
          latitude: lat, longitude: lng,
          name: 'Pinned Location',
          address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        });
        sendToMap('setMarker', { lat, lng, radiusKm });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'User-Agent': 'WakeMeUpApp/1.0' } }
          );
          const result = await res.json();
          if (result?.display_name) {
            setSelectedLocation({
              latitude: lat, longitude: lng,
              name: result.display_name.split(',')[0],
              address: result.display_name,
            });
            setSearchQuery(result.display_name.split(',')[0]);
          }
        } catch (e) {}
      }
    } catch (e) {}
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length < 3) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'WakeMeUpApp/1.0' } }
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (e) { setSearchResults([]); }
    setIsSearching(false);
  };

  const handleSelectResult = (item) => {
    Keyboard.dismiss();
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const name = item.display_name.split(',')[0];
    setSearchQuery(name);
    setSearchResults([]);
    setSelectedLocation({ latitude: lat, longitude: lng, name, address: item.display_name });
    sendToMap('setMarker', { lat, lng, radiusKm });
    sendToMap('flyTo', { lat, lng });
  };

  const handleMyLocation = () => {
    sendToMap('flyToUser', { lat: userLocation.latitude, lng: userLocation.longitude });
  };

  const handleNext = () => {
    if (!selectedLocation) return;
    navigation.navigate('SetupScreen', { location: selectedLocation, radiusKm });
  };

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { width: 100%; height: 100%; background: #0A0A0F; }
        .leaflet-tile-pane { filter: brightness(0.85) saturate(0.6); }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false, attributionControl: false })
          .setView([${userLocation.latitude}, ${userLocation.longitude}], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

        var marker = null;
        var circle = null;
        var currentLocationMarker = null;
        var currentLocationPulse = null;

        function setCurrentLocation(lat, lng) {
          if (currentLocationMarker) {
            map.removeLayer(currentLocationMarker);
            map.removeLayer(currentLocationPulse);
          }
          currentLocationPulse = L.circleMarker([lat, lng], {
            radius: 14, color: '#6C63FF', fillColor: '#6C63FF',
            fillOpacity: 0.15, weight: 1.5, opacity: 0.5,
          }).addTo(map);
          currentLocationMarker = L.circleMarker([lat, lng], {
            radius: 7, color: '#ffffff', fillColor: '#4A90FF',
            fillOpacity: 1, weight: 2.5,
          }).addTo(map);
        }

        setCurrentLocation(${userLocation.latitude}, ${userLocation.longitude});

        if (navigator.geolocation) {
          navigator.geolocation.watchPosition(
            function(pos) {
              setCurrentLocation(pos.coords.latitude, pos.coords.longitude);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'locationUpdate', lat: pos.coords.latitude, lng: pos.coords.longitude,
              }));
            },
            function(err) { console.warn('Geolocation error:', err); },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
          );
        }

        var pinIcon = L.divIcon({
          html: '<div style="width:18px;height:18px;background:#6C63FF;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
          iconSize: [18, 18], iconAnchor: [9, 18], className: '',
        });

        map.on('click', function(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapClick', lat: e.latlng.lat, lng: e.latlng.lng,
          }));
        });

        window.handleAction = function(action, data) {
          if (action === 'flyTo') map.flyTo([data.lat, data.lng], 15, { duration: 1.2 });
          if (action === 'flyToUser') map.flyTo([data.lat, data.lng], 16, { duration: 1.2 });
          if (action === 'setMarker') {
            if (marker) map.removeLayer(marker);
            if (circle) map.removeLayer(circle);
            marker = L.marker([data.lat, data.lng], { icon: pinIcon }).addTo(map);
            circle = L.circle([data.lat, data.lng], {
              radius: data.radiusKm * 1000, color: '#6C63FF',
              fillColor: '#6C63FF', fillOpacity: 0.12, weight: 2,
            }).addTo(map);
          }
          if (action === 'updateRadius') {
            if (circle) circle.setRadius(data.radiusKm * 1000);
          }
        };

        setTimeout(function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
        }, 500);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: leafletHTML }}
        style={styles.map}
        onMessage={handleWebViewMessage}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
      />

      {locationLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      )}

      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a place..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {isSearching
            ? <ActivityIndicator size="small" color={colors.primary} />
            : searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )
          }
        </View>
      </SafeAreaView>

      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.place_id?.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.searchResultItem} onPress={() => handleSelectResult(item)}>
                <Ionicons name="location-outline" size={16} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {item.display_name.split(',')[0]}
                  </Text>
                  <Text style={styles.resultAddress} numberOfLines={1}>
                    {item.display_name.split(',').slice(1, 3).join(',')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <TouchableOpacity style={styles.myLocationButton} onPress={handleMyLocation}>
        <Ionicons name="navigate" size={20} color={colors.primary} />
      </TouchableOpacity>

      {!selectedLocation && !locationLoading && (
        <View style={styles.hint}>
          <Ionicons name="hand-left-outline" size={14} color={colors.textMuted} />
          <Text style={styles.hintText}>Tap on the map to drop a pin</Text>
        </View>
      )}

      {selectedLocation && (
        <View style={styles.bottomPanel}>
          <View style={styles.locationRow}>
            <View style={styles.locationIconWrap}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationName} numberOfLines={1}>{selectedLocation.name}</Text>
              <Text style={styles.locationAddress} numberOfLines={1}>{selectedLocation.address}</Text>
            </View>
            <TouchableOpacity onPress={() => { setSelectedLocation(null); setSearchQuery(''); }}>
              <Ionicons name="close-circle-outline" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.radiusRow}>
            <Ionicons name="resize-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.radiusLabel}>Alert radius preview</Text>
            <TouchableOpacity style={styles.radiusBtn}
              onPress={() => setRadiusKm((v) => Math.max(0.2, +(v - 0.2).toFixed(1)))}>
              <Ionicons name="remove" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.radiusValue}>{radiusKm} km</Text>
            <TouchableOpacity style={styles.radiusBtn}
              onPress={() => setRadiusKm((v) => Math.min(20, +(v + 0.2).toFixed(1)))}>
              <Ionicons name="add" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Set Reminder Here</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  map: { flex: 1 },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: spacing.md,
  },
  loadingText: { ...typography.body },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', ...shadows.card,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, height: 44, gap: spacing.sm, ...shadows.card,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary, padding: 0 },
  searchResults: {
    position: 'absolute', top: 100, left: spacing.md, right: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    maxHeight: 240, ...shadows.card, zIndex: 100,
  },
  searchResultItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, gap: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  resultName: { ...typography.bodyBold, fontSize: 13 },
  resultAddress: { ...typography.caption, marginTop: 1 },
  myLocationButton: {
    position: 'absolute', right: spacing.md, bottom: 220,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', ...shadows.card,
  },
  hint: {
    position: 'absolute', bottom: 40, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.bgCard + 'EE', borderRadius: radius.full,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  hintText: { ...typography.caption },
  bottomPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderColor: colors.border,
    padding: spacing.md, paddingBottom: spacing.xl,
    gap: spacing.md, ...shadows.card,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  locationIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primaryGlow,
    alignItems: 'center', justifyContent: 'center',
  },
  locationName: { ...typography.bodyBold },
  locationAddress: { ...typography.caption, marginTop: 2 },
  radiusRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.bg, borderRadius: radius.md,
    padding: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  radiusLabel: { ...typography.caption, flex: 1 },
  radiusBtn: {
    width: 30, height: 30, borderRadius: radius.sm,
    backgroundColor: colors.bgElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  radiusValue: { ...typography.bodyBold, color: colors.primary, minWidth: 45, textAlign: 'center' },
  nextButton: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingVertical: spacing.md, ...shadows.glow(colors.primary),
  },
  nextButtonText: { ...typography.bodyBold, color: '#fff', fontSize: 16 },
});