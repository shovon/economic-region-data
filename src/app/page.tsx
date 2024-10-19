"use client";

import { useEffect, useRef, useState } from "react";
import ReactMap, {
	Source,
	Layer,
	MapRef,
	FillLayer,
} from "react-map-gl/maplibre";

// Function to generate a random color in hex format
const getRandomColor = () => {
	const letters = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
};

// Create a layer for your GeoJSON features with random colors
const randomColorLayer: FillLayer = {
	id: "random-color-layer",
	type: "fill",
	paint: {
		"fill-color": [
			"interpolate",
			["linear"],
			["to-number", ["get", "ERNAME"]],
			1,
			"#FF0000",
			13,
			"#0000FF",
		],
		"fill-opacity": 0.7,
	},
};

export default function MapExample() {
	const mapRef = useRef<MapRef>(null);
	const [allData, setAllData] = useState<unknown>(null);
	const [colorExpression, setColorExpression] = useState<any[]>([]);

	const [viewState, setViewState] = useState({
		longitude: -100,
		latitude: 40,
		zoom: 3.5,
	});

	useEffect(() => {
		fetch("/canada.json")
			.then((resp) => resp.json())
			.then(setAllData)
			.catch(console.error);
	}, []);

	useEffect(() => {
		if (allData) {
			const features = (allData as any).features;
			const uniquePRUIDs = [
				...new Set(features.map((f: any) => f.properties.ERUID)),
			];
			const randomColors = uniquePRUIDs.map(() => getRandomColor());

			setColorExpression([
				"match",
				["get", "ERUID"],
				...uniquePRUIDs.flatMap((id, index) => [id, randomColors[index]]),
				"#000000", // default color
			]);
		}
	}, [allData]);

	const randomColorLayer: FillLayer = {
		id: "random-color-layer",
		type: "fill",
		paint: {
			"fill-color": colorExpression,
			"fill-opacity": 0.7,
		},
	};

	return (
		<div className="relative">
			<ReactMap
				{...viewState}
				ref={mapRef}
				initialViewState={{
					latitude: 49.2827,
					longitude: -123.1207,
					zoom: 10,
				}}
				onMove={(e) => setViewState(e.viewState)}
				style={{
					width: "100vw",
					height: "100vh",
				}}
				mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`}
			>
				<Source type="geojson" data={allData}>
					<Layer {...randomColorLayer} />
				</Source>
			</ReactMap>
		</div>
	);
}
