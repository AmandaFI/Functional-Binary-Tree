import { FilterFnType, ForEachFnType, MapFnType, NodeForEachFnType, NodeType, OrderType, ReduceFnType } from "./binaryTreeTypes";

export const visitNodes = <T extends {}>(node: NodeType<T> | null, order: OrderType = "Inorder"): NodeType<T>[] => {
	if (!node) return [];
	const leftChildVisitResult = visitNodes(node.left, order);
	const rightChildVisitResult = visitNodes(node.right, order);
	switch (order) {
		case "Inorder":
			return [...leftChildVisitResult, node, ...rightChildVisitResult];
		case "Preorder":
			return [node, ...leftChildVisitResult, ...rightChildVisitResult];
		case "Postorder":
			return [...leftChildVisitResult, ...rightChildVisitResult, node];
		default:
			const _exhaustiveCheck: never = order;
			throw new Error("Unknown order.");
	}
};

// yield* transfere a chamada do next para outro generator, ou seja, o outro generator que deve atender o next e fazer o yield de algo
// function* iterator(order: OrderType = "Inorder", node = root): Iterator<T> {
export function* visitElements<T extends {}>(
	order: OrderType = "Inorder",
	node: NodeType<T>
): Generator<T, undefined, undefined> {
	if (order === "Preorder") yield node.element;
	if (node.left) yield* visitElements(order, node.left);
	if (order === "Inorder") yield node.element;
	if (node.right) yield* visitElements(order, node.right);
	if (order === "Postorder") yield node.element;
}

export const mapTree = <T extends {}>(
	fn: MapFnType<T>,
	root: NodeType<T>,
	order: OrderType = "Inorder"
): ReturnType<typeof fn>[] => {
	const recursiveMap = ([currentElement, ...rest]: T[], index = 0): ReturnType<typeof fn>[] => {
		if (!currentElement) return [];
		return [fn(currentElement, index), ...recursiveMap(rest, index + 1)];
	};

	return recursiveMap([...visitElements<T>(order, root)]);
};

export const filterTree = <T extends {}>(fn: FilterFnType<T>, root: NodeType<T>, order: OrderType = "Inorder"): T[] => {
	const recursiveFilter = ([currentElement, ...rest]: T[], index = 0): T[] => {
		if (!currentElement) return [];
		const fnResult = fn(currentElement, index) ? [currentElement] : [];
		return [...fnResult, ...recursiveFilter(rest, index + 1)];
	};

	return recursiveFilter([...visitElements<T>(order, root)]);
};

// testar reduce
export const reduceTree = <T extends {}>(
	fn: ReduceFnType<T>,
	acc: any = undefined,
	root: NodeType<T>,
	order: OrderType = "Inorder"
): ReturnType<typeof fn> => {
	const recursiveReduce = (array: T[], acc: any = undefined, index = 0): ReturnType<typeof fn> => {
		if (array.length === 0) return acc;
		if (acc === undefined) [acc, ...array] = array;
		return recursiveReduce(array.slice(1), fn(acc, array[0], index + 1), index + 1);
	};
	return recursiveReduce([...visitElements<T>(order, root)], fn, acc);
};

export const forEachElement = <T extends {}>(fn: ForEachFnType<T>, root: NodeType<T>): void => {
	for (let [index, element] of [...visitElements<T>("Inorder", root)].entries()) fn(element, index);
};

export const forEachNode = <T extends {}>(
	fn: NodeForEachFnType<T>,
	rootNode: NodeType<T>,
	order: OrderType = "Inorder"
): void => {
	const orderedNodes = visitNodes(rootNode, order);
	for (let [index, node] of orderedNodes.entries()) fn(node, index);
};

export const traverseTree = <T extends {}>(order: OrderType = "Inorder", root: NodeType<T>) => [...visitElements(order, root)];
