"use client";

import { useEffect, useRef, useState } from "react";
import ReactMap, {
	Source,
	Layer,
	MapRef,
	FillLayer,
} from "react-map-gl/maplibre";
import { DataDrivenPropertyValueSpecification } from "maplibre-gl";

// Function to generate a random color in hex format
const getRandomColor = () => {
	const letters = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
};

export default function MapExample() {
	const mapRef = useRef<MapRef>(null);
	const [allData, setAllData] = useState<unknown>(null);
	const [colorExpression, setColorExpression] =
		useState<DataDrivenPropertyValueSpecification<string>>();

	const [viewState, setViewState] = useState({
		longitude: -100,
		latitude: 65,
		zoom: 3,
	});

	useEffect(() => {
		fetch("/canada.json")
			.then((resp) => resp.json())
			.then(setAllData)
			.catch(console.error);
	}, []);

	useEffect(() => {
		if (allData) {
			const features =
				(allData as { features?: { properties?: { ERUID?: string } }[] })
					.features ?? [];
			const uniquePRUIDs = [
				...new Set(features.map((f) => f.properties?.ERUID ?? "")),
			];
			const randomColors = uniquePRUIDs.map(() => getRandomColor());

			setColorExpression([
				"match",
				["get", "ERUID"],
				...uniquePRUIDs.flatMap((id, index) => [id, randomColors[index]]),
				"#000000", // default color
			] as unknown as DataDrivenPropertyValueSpecification<string>);
		}
	}, [allData]);

	const randomColorLayer: FillLayer = {
		source: "",
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
