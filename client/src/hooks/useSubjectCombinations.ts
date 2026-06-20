import { useEffect, useState } from "react";
import { fetchSubjectCombinations } from "@/services/api";

// Module-level cache of code → subjects so every component shares one built map
// (fetchSubjectCombinations itself is already memoized for the network call).
let cachedMap: Map<string, string[]> | null = null;

/**
 * Returns a map from subject-combination code (e.g. "A00") to its subject names.
 * Empty until the (cached) combinations list resolves.
 */
export function useSubjectCombinationSubjects(): Map<string, string[]> {
	const [map, setMap] = useState<Map<string, string[]>>(
		() => cachedMap ?? new Map(),
	);

	useEffect(() => {
		if (cachedMap) return;
		let active = true;
		fetchSubjectCombinations()
			.then((list) => {
				cachedMap = new Map(list.map((c) => [c.code, c.subjects]));
				if (active) setMap(cachedMap);
			})
			.catch(() => {
				/* tooltip just won't show subjects — combo codes still render */
			});
		return () => {
			active = false;
		};
	}, []);

	return map;
}
