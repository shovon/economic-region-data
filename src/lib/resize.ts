import { useEffect, useRef, useState } from "react";

export function useResizeObserver() {
	const ref = useRef<HTMLElement | null>(null);
	const [width, setWidth] = useState(NaN);
	const [height, setHeight] = useState(NaN);

	useEffect(() => {
		if (ref.current !== null) {
			const current = ref.current;
			const observer = new ResizeObserver((entries) => {
				if (entries.length <= 0) {
					return;
				}

				setWidth(entries[0].contentRect.width);
				setHeight(entries[0].contentRect.height);
			});

			observer.observe(current);

			return () => {
				observer.disconnect();
			};
		}
	}, []);

	return { width, height, ref };
}
