import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

interface RouteMapProps {
  origin?: string;
  destination?: string;
  vanPosition?: LatLngLiteral;
  bookingId?: number;
  isVanOwner?: boolean;
  onVanPositionUpdate?: (position: LatLngLiteral) => void;
}

// Default UK center position
const UK_CENTER = { lat: 54.7023545, lng: -3.2765753 };
const DEFAULT_ZOOM = 6;

function Directions({
  origin,
  destination,
  vanPosition,
  onRouteCalculated
}: {
  origin: string;
  destination: string;
  vanPosition?: LatLngLiteral;
  onRouteCalculated?: (result: DirectionsResult) => void;
}) {
  const map = useMap();
  const routeRef = useRef<google.maps.Polyline | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const vanMarkerRef = useRef<google.maps.Marker | null>(null);

  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [route, setRoute] = useState<google.maps.DirectionsResult | null>(null);
  const [routePath, setRoutePath] = useState<Array<LatLngLiteral>>([]);
  const [animationPosition, setAnimationPosition] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animationRef = useRef<number | null>(null);
  
  const mapsLibrary = useMapsLibrary('routes');
  const geocodingLibrary = useMapsLibrary('geocoding');

  useEffect(() => {
    if (!mapsLibrary || !map) return;
    
    setDirectionsService(new mapsLibrary.DirectionsService());
    
    const newDirectionsRenderer = new mapsLibrary.DirectionsRenderer({
      map,
      suppressMarkers: true,
      preserveViewport: true,
    });
    
    setDirectionsRenderer(newDirectionsRenderer);
    
    return () => {
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
      if (routeRef.current) {
        routeRef.current.setMap(null);
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (vanMarkerRef.current) {
        vanMarkerRef.current.setMap(null);
      }
    };
  }, [mapsLibrary, map]);

  // Create custom van marker
  useEffect(() => {
    if (!map || !vanPosition) return;

    if (!vanMarkerRef.current) {
      vanMarkerRef.current = new google.maps.Marker({
        map,
        position: vanPosition,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4F46E5",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
        title: "Van Position",
      });
    } else {
      vanMarkerRef.current.setPosition(vanPosition);
    }
  }, [map, vanPosition]);

  // Calculate route when origin/destination change
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin || !destination || !geocodingLibrary) return;

    const fetchRoute = async () => {
      try {
        const result = await directionsService.route({
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING
        });
        
        setRoute(result);
        directionsRenderer.setDirections(result);

        // Extract route coordinates for animation
        const path = result.routes[0].overview_path.map(point => ({
          lat: point.lat(),
          lng: point.lng()
        }));
        setRoutePath(path);

        if (onRouteCalculated) {
          onRouteCalculated(result);
        }

        // Create start and end markers
        if (map) {
          // Create start marker if it doesn't exist
          if (!markerRef.current) {
            const startLocation = result.routes[0].legs[0].start_location;
            markerRef.current = new google.maps.Marker({
              position: { lat: startLocation.lat(), lng: startLocation.lng() },
              map,
              label: { text: "A", color: "white" },
              title: "Starting Point"
            });

            // Create end marker
            const endLocation = result.routes[0].legs[0].end_location;
            new google.maps.Marker({
              position: { lat: endLocation.lat(), lng: endLocation.lng() },
              map,
              label: { text: "B", color: "white" },
              title: "Destination"
            });
          }
        }

        // Fit bounds to show the entire route
        if (map) {
          const bounds = new google.maps.LatLngBounds();
          result.routes[0].overview_path.forEach(point => {
            bounds.extend(point);
          });
          map.fitBounds(bounds);
        }
      } catch (error) {
        console.error("Error fetching directions:", error);
      }
    };

    fetchRoute();
  }, [directionsService, directionsRenderer, origin, destination, map, geocodingLibrary, onRouteCalculated]);

  // Animation functions
  const startAnimation = () => {
    if (!routePath.length || isAnimating) return;
    
    setIsAnimating(true);
    setAnimationPosition(0);
    
    let step = 0;
    const totalSteps = 300; // Animation duration in steps
    
    const animate = () => {
      if (step >= totalSteps) {
        setIsAnimating(false);
        animationRef.current = null;
        return;
      }
      
      const position = Math.floor((step / totalSteps) * routePath.length);
      setAnimationPosition(position);
      
      if (position < routePath.length && vanMarkerRef.current) {
        vanMarkerRef.current.setPosition(routePath[position]);
      }
      
      step++;
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  };

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {route && (
        <div className="flex gap-2 mt-3">
          <Button 
            onClick={startAnimation}
            disabled={isAnimating || !routePath.length}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
          >
            Simulate Van Movement
          </Button>
          
          {isAnimating && (
            <Button 
              onClick={stopAnimation}
              variant="outline"
            >
              Stop Simulation
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function RouteMap({
  origin = "",
  destination = "",
  vanPosition,
  bookingId,
  isVanOwner = false,
  onVanPositionUpdate
}: RouteMapProps) {
  const [originInput, setOriginInput] = useState(origin);
  const [destinationInput, setDestinationInput] = useState(destination);
  const [routeCalculated, setRouteCalculated] = useState(false);
  const [currentVanPosition, setCurrentVanPosition] = useState<LatLngLiteral | undefined>(vanPosition);
  const [route, setRoute] = useState<DirectionsResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mapOptions = {
    mapId: "van-tracking-map",
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  };

  const handleCalculateRoute = () => {
    if (!originInput || !destinationInput) {
      setErrorMessage("Please enter both origin and destination");
      return;
    }
    setErrorMessage(null);
    setRouteCalculated(true);
  };

  const handleRouteCalculated = (result: DirectionsResult) => {
    setRoute(result);
    // If we have a callback for position updates, use the first point of the route as initial position
    if (onVanPositionUpdate && result.routes[0]?.overview_path[0]) {
      const startPoint = result.routes[0].overview_path[0];
      const position = { lat: startPoint.lat(), lng: startPoint.lng() };
      setCurrentVanPosition(position);
      onVanPositionUpdate(position);
    }
  };

  // Handle real position updates if a van owner is tracking
  const handleUpdateRealPosition = () => {
    if (navigator.geolocation && isVanOwner && bookingId) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentVanPosition(newPosition);
          
          if (onVanPositionUpdate) {
            onVanPositionUpdate(newPosition);
          }
          
          // If this is a real tracking scenario, send the update to the server
          fetch('/api/van-tracking/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bookingId,
              position: newPosition
            }),
          }).catch(err => console.error("Error updating position:", err));
        },
        (error) => {
          console.error("Error getting location:", error);
          setErrorMessage("Unable to access your current location. Please enable location services.");
        }
      );
    }
  };

  return (
    <div className="w-full h-full">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
            Route Planner & Van Tracking
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="origin" className="text-sm font-medium">Origin</label>
                  <Input
                    id="origin"
                    type="text"
                    placeholder="Enter pickup location"
                    value={originInput}
                    onChange={(e) => setOriginInput(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label htmlFor="destination" className="text-sm font-medium">Destination</label>
                  <Input
                    id="destination"
                    type="text"
                    placeholder="Enter dropoff location"
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCalculateRoute}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                >
                  Calculate Route
                </Button>
                
                {isVanOwner && (
                  <Button 
                    onClick={handleUpdateRealPosition}
                    variant="outline"
                    className="border-blue-600 text-blue-700"
                  >
                    Update My Position
                  </Button>
                )}
              </div>
              
              {errorMessage && (
                <div className="text-red-500 text-sm">{errorMessage}</div>
              )}
            </div>
            
            <div className="h-[400px] w-full rounded-md overflow-hidden border">
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                  mapId="van-tracking-map"
                  defaultCenter={UK_CENTER}
                  defaultZoom={DEFAULT_ZOOM}
                  gestureHandling="cooperative"
                  mapTypeId="roadmap"
                  styles={mapOptions.styles}
                  className="w-full h-full"
                >
                  {routeCalculated && originInput && destinationInput && (
                    <Directions
                      origin={originInput}
                      destination={destinationInput}
                      vanPosition={currentVanPosition}
                      onRouteCalculated={handleRouteCalculated}
                    />
                  )}
                </Map>
              </APIProvider>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-slate-500">
            {route && route.routes[0]?.legs[0] && (
              <div className="flex flex-col gap-1">
                <span>
                  <strong>Distance:</strong> {route.routes[0].legs[0].distance?.text}
                </span>
                <span>
                  <strong>Duration:</strong> {route.routes[0].legs[0].duration?.text}
                </span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}