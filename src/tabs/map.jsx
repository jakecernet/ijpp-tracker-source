import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	useMap,
	useMapEvents,
	FeatureGroup,
} from "react-leaflet";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import arrivaPNG from "../img/arriva.png";
import lppPNG from "../img/lpp.png";
import nomagoPNG from "../img/nomago.png";
import marpromPNG from "../img/marprom.png";
import userPNG from "../img/user.png";

const MapCenter = React.memo(({ center }) => {
	const map = useMap();

	useEffect(() => {
		map.setView(center);
	}, [center, map]);

	return null;
});

const stopIcon = new L.Icon({
	iconUrl: "https://cdn-icons-png.flaticon.com/512/7561/7561230.png",
	iconSize: [30, 30],
	iconAnchor: [15, 30],
});

const userIcon = new L.Icon({
	iconUrl: userPNG,
	iconSize: [35, 35],
	iconAnchor: [17.5, 35],
});

const createOperatorIcon = (iconUrl) =>
	new L.Icon({
		iconUrl,
		iconSize: [35, 35],
		iconAnchor: [17.5, 35],
	});

const operatorIcons = {
	"Javno podjetje Ljubljanski potniški promet d.o.o.":
		createOperatorIcon(lppPNG),
	"Nomago d.o.o.": createOperatorIcon(nomagoPNG),
	"Arriva d.o.o.": createOperatorIcon(arrivaPNG),
	"Javno podjetje za mestni potniški promet Marprom, d.o.o.":
		createOperatorIcon(marpromPNG),
};

const getBusIcon = (operator) =>
	operatorIcons[operator] ||
	createOperatorIcon(
		"https://cdn-icons-png.flaticon.com/512/6618/6618280.png"
	);

const Map = React.memo(
	({
		gpsPositions,
		busStops,
		activeStation,
		setActiveStation,
		userLocation,
		setCurentUrl,
	}) => {
		const [map, setMap] = useState(null);
		const position = useMemo(
			() => activeStation.coordinates || userLocation,
			[activeStation, userLocation]
		);

		const [mapCenter, setMapCenter] = useState(position);

		useEffect(() => {
			setMapCenter(position);
		}, [position]);

		const handleStationClick = useCallback(
			(busStop) => {
				setActiveStation({
					name: busStop.name,
					coordinates: busStop.gpsLocation,
					id: busStop.id,
				});
				setMapCenter(busStop.gpsLocation);
				localStorage.setItem(
					"activeStation",
					JSON.stringify({
						name: busStop.name,
						coordinates: busStop.gpsLocation,
						id: busStop.id,
					})
				);
				setCurentUrl("/arrivals");
				document.location.href = "/#/arrivals";
			},
			[setActiveStation, setCurentUrl]
		);

		const memoizedGpsPositions = useMemo(
			() =>
				gpsPositions.map((gpsPosition, index) => (
					<Marker
						key={`gps-${index}`}
						position={gpsPosition.gpsLocation}
						icon={getBusIcon(gpsPosition.operator)}
						title={gpsPosition.route}>
						<Popup>
							<p>{gpsPosition.route}</p>
							<p>{gpsPosition.operator}</p>
							<p>{gpsPosition.gpsLocation.join(", ")}</p>
						</Popup>
					</Marker>
				)),
			[gpsPositions]
		);

		const memoizedBusStops = useMemo(
			() =>
				busStops.map((busStop, index) => (
					<Marker
						key={`stop-${index}`}
						position={busStop.gpsLocation}
						icon={stopIcon}
						title={busStop.name}>
						<Popup>
							<h3>{busStop.name}</h3>
							<button onClick={() => handleStationClick(busStop)}>
								Tukaj sem
							</button>
						</Popup>
					</Marker>
				)),
			[busStops, handleStationClick]
		);

		return (
			<div className="insideDiv">
				<h2>Live Bus Map</h2>
				<div className="map-container">
					<MapContainer
						center={mapCenter}
						zoom={13}
						style={{ height: "100%", width: "100%" }}
						attributionControl={false}
						scrollWheelZoom={true}
						whenCreated={setMap}>
						<MapCenter center={mapCenter} />
						<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
						<FeatureGroup>
							<MarkerClusterGroup
								showCoverageOnHover={false}
								spiderfyOnMaxZoom={false}
								disableClusteringAtZoom={10}
								maxClusterRadius={30}>
								{memoizedGpsPositions}
							</MarkerClusterGroup>
						</FeatureGroup>
						<FeatureGroup>
							<MarkerClusterGroup
								showCoverageOnHover={false}
								spiderfyOnMaxZoom={false}
								disableClusteringAtZoom={16}
								maxClusterRadius={30}>
								{memoizedBusStops}
							</MarkerClusterGroup>
						</FeatureGroup>
						{userLocation && (
							<Marker
								position={userLocation}
								icon={userIcon}
								title="Tukaj sem">
								<Popup>
									<h3>Vaša lokacija</h3>
								</Popup>
							</Marker>
						)}
					</MapContainer>
				</div>
			</div>
		);
	}
);

export default Map;
