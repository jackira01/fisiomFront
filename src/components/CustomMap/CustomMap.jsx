"use client";

import axios from "axios";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import ServicioMainCardSmall from "../Servicios/ServicioMainCardSmall";
import ProfessionalsUpdate from "./ProfessionalsUpdate";
import UsersUpdate from "./UsersUpdate";
import CustomControls from "./CustomControls";
import useGeolocation from "@/hooks/useGeolocation";
import { apiEndpoints } from "../../api_endpoints";

const CustomMap = ({ markers, setMarkers, user, toggle }) => {
  const customIcon = new Icon({
    iconUrl: "/Red-Circle-Transparent.png", //"https://cdn-icons-png.flaticon.com/128/684/684908.png",
    iconSize: [96, 96],
    className: "opacity-20",
  });
  const userIcon = new Icon({
    iconUrl: "/pin_red.png",
    iconSize: [38, 38],
  });

  const location = useGeolocation();
  const pathname = usePathname();

  // Calculate center based on first valid marker or default to user location
  const getCenter = () => {
    if (markers.length > 0 && markers[0]?.coordinates) {
      return {
        lat: markers[0].coordinates[0] || 0,
        lng: markers[0].coordinates[1] || 0,
      };
    }
    if (location?.user && location.user.length === 2) {
      return {
        lat: location.user[0],
        lng: location.user[1],
      };
    }
    return { lat: 0, lng: 0 }; // Default center
  };

  if (markers.length) {
    return (
      <MapContainer
        center={getCenter()}
        zoom={15}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="https://www.openstreetmap.org/copyright contributors"
        />
        <CustomControls />
        {pathname === "/servicios" && (
          <ProfessionalsUpdate
            markers={markers}
            setMarkers={setMarkers}
            toggle={toggle}
          />
        )}
        {pathname === "/comunidad" && (
          <UsersUpdate
            markers={markers}
            setMarkers={setMarkers}
            toggle={toggle}
          />
        )}
        {location?.user ? (
          <Marker position={location.user} icon={userIcon}></Marker>
        ) : null}
        {markers?.map((e, i) => {
          return (
            <Marker 
              key={i} 
              position={
                Array.isArray(e.coordinates) && e.coordinates.length === 2
                  ? e.coordinates
                  : [0, 0]
              } 
              icon={customIcon}
            >
              {/* <Popup>
                <ServicioMainCardSmall profesional={e} />
              </Popup> */}
            </Marker>
          );
        })}
      </MapContainer>
    );
  } else {
    return null;
  }
};

export default CustomMap;
